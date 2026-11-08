// Package events publishes and consumes domain events on a Redis-protocol stream (Dragonfly).
// Delivery is at least once: a consumer acknowledges an entry only after its handler succeeds, so
// handlers must be idempotent (the services keep processed_events tables for that).
package events

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	// maxLen trims the stream approximately, so memory stays bounded.
	maxLen = 100000
	// batch is how many entries one read returns.
	batch = 100
	// retryDelay is the pause after a failed read before trying again.
	retryDelay = time.Second
)

// blockTime is how long one read waits for new entries; it is a variable so tests can shorten it.
var blockTime = 5 * time.Second

// claimIdle is how long an entry must sit pending before another read reclaims it, and how often
// the consumer looks for such entries; a variable so tests can shorten it.
var claimIdle = time.Minute

// Envelope is the event wrapper every producer and consumer agrees on.
type Envelope struct {
	EventID       string          `json:"event_id"`
	EventType     string          `json:"event_type"`
	SchemaVersion int             `json:"schema_version"`
	TenantID      string          `json:"tenant_id"`
	ActorID       string          `json:"actor_id"`
	OccurredAt    time.Time       `json:"occurred_at"`
	Payload       json.RawMessage `json:"payload"`
}

// Publisher appends events to one stream.
type Publisher struct {
	rdb    *redis.Client
	stream string
}

// NewPublisher returns a Publisher for stream.
func NewPublisher(rdb *redis.Client, stream string) *Publisher {
	return &Publisher{rdb: rdb, stream: stream}
}

// Publish appends env with its event type in the "type" field and the JSON envelope in "data".
func (p *Publisher) Publish(ctx context.Context, env Envelope) error {
	data, err := json.Marshal(env)
	if err != nil {
		return fmt.Errorf("marshal event %s: %w", env.EventType, err)
	}
	err = p.rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: p.stream,
		MaxLen: maxLen,
		Approx: true,
		Values: map[string]any{"type": env.EventType, "data": data},
	}).Err()
	if err != nil {
		return fmt.Errorf("publish event %s to %s: %w", env.EventType, p.stream, err)
	}
	return nil
}

// Handler processes one event. Returning an error leaves the entry unacknowledged.
type Handler func(ctx context.Context, env Envelope) error

// RunConsumer reads stream as member consumer of group until ctx is cancelled, then returns nil.
// On start it first re-processes the entries this consumer left pending, then reads new ones.
// An entry is acknowledged when its handler returns nil, when its type has no handler, or when its
// body cannot be decoded (retrying would never succeed). A handler error is logged and the entry
// stays pending; once it has been idle for claimIdle any consumer of the group reclaims it
// (XAUTOCLAIM) and retries, so entries of consumers that never return are not lost either.
func RunConsumer(ctx context.Context, rdb *redis.Client, stream, group, consumer string, handlers map[string]Handler) error {
	err := rdb.XGroupCreateMkStream(ctx, stream, group, "$").Err()
	if err != nil && !strings.HasPrefix(err.Error(), "BUSYGROUP") {
		if ctx.Err() != nil {
			return nil
		}
		return fmt.Errorf("create group %s on %s: %w", group, stream, err)
	}

	id := "0" // pending entries first; ">" once none are left
	lastClaim := time.Now()
	for ctx.Err() == nil {
		if id == ">" && time.Since(lastClaim) >= claimIdle {
			reclaim(ctx, rdb, stream, group, consumer, handlers)
			lastClaim = time.Now()
		}
		streams, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group: group, Consumer: consumer, Streams: []string{stream, id}, Count: batch, Block: blockTime,
		}).Result()
		if err != nil && !errors.Is(err, redis.Nil) {
			if ctx.Err() != nil {
				return nil
			}
			slog.ErrorContext(ctx, "read event stream", "stream", stream, "group", group, "error", err)
			select {
			case <-ctx.Done():
				return nil
			case <-time.After(retryDelay):
			}
			continue
		}

		for _, s := range streams {
			if id != ">" && len(s.Messages) > 0 {
				id = s.Messages[len(s.Messages)-1].ID // pending entries that fail again are skipped, not re-read in a loop
			}
			process(ctx, rdb, stream, group, s.Messages, handlers)
		}
		if id != ">" && (len(streams) == 0 || len(streams[0].Messages) == 0) {
			id = ">"
		}
	}
	return nil
}

// process runs the handlers for msgs and acknowledges the entries that succeeded.
func process(ctx context.Context, rdb *redis.Client, stream, group string, msgs []redis.XMessage, handlers map[string]Handler) {
	for _, msg := range msgs {
		if handle(ctx, stream, msg, handlers) {
			if err := rdb.XAck(ctx, stream, group, msg.ID).Err(); err != nil {
				slog.ErrorContext(ctx, "ack event", "stream", stream, "id", msg.ID, "error", err)
			}
		}
	}
}

// reclaim takes over entries any consumer of the group has left pending for at least claimIdle
// (a failed handler, or a consumer that never came back) and processes them here.
func reclaim(ctx context.Context, rdb *redis.Client, stream, group, consumer string, handlers map[string]Handler) {
	start := "0-0"
	for ctx.Err() == nil {
		msgs, next, err := rdb.XAutoClaim(ctx, &redis.XAutoClaimArgs{
			Stream: stream, Group: group, Consumer: consumer, MinIdle: claimIdle, Start: start, Count: batch,
		}).Result()
		if err != nil {
			if ctx.Err() == nil {
				slog.ErrorContext(ctx, "reclaim pending events", "stream", stream, "group", group, "error", err)
			}
			return
		}
		process(ctx, rdb, stream, group, msgs, handlers)
		if next == "0-0" || next == "" {
			return
		}
		start = next
	}
}

// handle runs the handler for msg and reports whether the entry should be acknowledged.
func handle(ctx context.Context, stream string, msg redis.XMessage, handlers map[string]Handler) bool {
	typ, _ := msg.Values["type"].(string)
	h, ok := handlers[typ]
	if !ok {
		return true
	}
	raw, _ := msg.Values["data"].(string)
	var env Envelope
	if err := json.Unmarshal([]byte(raw), &env); err != nil {
		slog.ErrorContext(ctx, "drop undecodable event", "stream", stream, "id", msg.ID, "type", typ, "error", err)
		return true
	}
	if err := h(ctx, env); err != nil {
		slog.ErrorContext(ctx, "handle event", "stream", stream, "id", msg.ID, "type", typ, "tenant_id", env.TenantID, "error", err)
		return false
	}
	return true
}
