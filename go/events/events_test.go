package events

import (
	"context"
	"encoding/json"
	"errors"
	"sync/atomic"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

const (
	stream = "hris:events"
	group  = "g"
)

func newClient(t *testing.T) *redis.Client {
	t.Helper()
	blockTime = 50 * time.Millisecond
	rdb := redis.NewClient(&redis.Options{Addr: miniredis.RunT(t).Addr()})
	t.Cleanup(func() { _ = rdb.Close() })
	return rdb
}

// start runs a consumer and returns a stop func that cancels it and waits for a nil return.
func start(t *testing.T, rdb *redis.Client, handlers map[string]Handler) (stop func()) {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- RunConsumer(ctx, rdb, stream, group, "c1", handlers) }()
	return func() {
		cancel()
		select {
		case err := <-done:
			if err != nil {
				t.Errorf("RunConsumer returned %v on cancel, want nil", err)
			}
		case <-time.After(5 * time.Second):
			t.Error("RunConsumer did not return after cancel")
		}
	}
}

func pending(t *testing.T, rdb *redis.Client) int64 {
	t.Helper()
	p, err := rdb.XPending(context.Background(), stream, group).Result()
	if err != nil {
		t.Fatalf("XPending: %v", err)
	}
	return p.Count
}

func eventually(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s", what)
}

func publish(t *testing.T, rdb *redis.Client, typ string) {
	t.Helper()
	env := Envelope{EventID: "e1", EventType: typ, SchemaVersion: 1, TenantID: "t1", OccurredAt: time.Now().UTC(), Payload: json.RawMessage(`{"k":"v"}`)}
	if err := NewPublisher(rdb, stream).Publish(context.Background(), env); err != nil {
		t.Fatalf("Publish: %v", err)
	}
}

func TestConsumer_handledEventIsAcked(t *testing.T) {
	rdb := newClient(t)
	var got atomic.Value
	stop := start(t, rdb, map[string]Handler{"a.b": func(_ context.Context, env Envelope) error { got.Store(env); return nil }})
	defer stop()
	time.Sleep(100 * time.Millisecond) // group created at "$" before publishing

	publish(t, rdb, "a.b")

	eventually(t, "handler call", func() bool { return got.Load() != nil })
	env := got.Load().(Envelope)
	if env.EventType != "a.b" || env.TenantID != "t1" || string(env.Payload) != `{"k":"v"}` {
		t.Errorf("envelope = %+v", env)
	}
	eventually(t, "ack", func() bool { return pending(t, rdb) == 0 })
}

func TestConsumer_handlerErrorStaysPendingAndIsRedeliveredAfterRestart(t *testing.T) {
	rdb := newClient(t)
	var calls atomic.Int32
	stop := start(t, rdb, map[string]Handler{"a.b": func(context.Context, Envelope) error { calls.Add(1); return errors.New("boom") }})
	time.Sleep(100 * time.Millisecond)
	publish(t, rdb, "a.b")
	eventually(t, "first attempt", func() bool { return calls.Load() == 1 })
	if n := pending(t, rdb); n != 1 {
		t.Fatalf("pending = %d, want 1 after handler error", n)
	}
	stop()

	var redelivered atomic.Bool
	stop = start(t, rdb, map[string]Handler{"a.b": func(context.Context, Envelope) error { redelivered.Store(true); return nil }})
	defer stop()

	eventually(t, "redelivery", redelivered.Load)
	eventually(t, "ack after redelivery", func() bool { return pending(t, rdb) == 0 })
}

func TestConsumer_unknownTypeIsAcked(t *testing.T) {
	rdb := newClient(t)
	var known atomic.Bool
	stop := start(t, rdb, map[string]Handler{"a.b": func(context.Context, Envelope) error { known.Store(true); return nil }})
	defer stop()
	time.Sleep(100 * time.Millisecond)

	publish(t, rdb, "other.type")
	publish(t, rdb, "a.b") // read after the unknown entry, so once handled the unknown one was processed

	eventually(t, "known event", known.Load)
	eventually(t, "ack of both entries", func() bool { return pending(t, rdb) == 0 })
}
