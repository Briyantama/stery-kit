<script lang="ts">
	// Every kit component in its main variants, light and dark side by side.
	// Mount from a consuming app route; the app must load '@stery/kit/styles/theme.css'.
	// Overlay content (dialog, sheet, popover, menu, tooltip) is portaled to <body> by bits-ui,
	// so it takes the page theme rather than the dark half's data-theme.
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger,
		Alert,
		AppShell,
		Avatar,
		AvatarGroup,
		Badge,
		Breadcrumbs,
		Button,
		ButtonGroup,
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
		Checkbox,
		ConfirmDialog,
		Container,
		DescriptionList,
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
		EmptyState,
		FilterBar,
		FormField,
		Input,
		Label,
		NativeSelect,
		Navbar,
		PageHeader,
		Pagination,
		Popover,
		PopoverContent,
		PopoverTrigger,
		Progress,
		RadioGroup,
		RadioGroupItem,
		SearchInput,
		Select,
		Separator,
		Sheet,
		SheetContent,
		SheetDescription,
		SheetHeader,
		SheetTitle,
		SheetTrigger,
		SidebarNav,
		Skeleton,
		Spinner,
		Stack,
		StatCard,
		Switch,
		Table,
		TableBody,
		TableCaption,
		TableCell,
		TableEmpty,
		TableHead,
		TableHeader,
		TableLoading,
		TableRow,
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger,
		Textarea,
		Toaster,
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger,
		formatCurrency,
		formatDate,
		formatRelativeTime,
		toast,
		type SelectItem,
		type SidebarNavGroup
	} from '../src/ui';

	type Half = 'light' | 'dark';
	const halves: Half[] = ['light', 'dark'];

	// State that must not be shared between the two halves, keyed by half.
	let confirmOpen = $state<Record<Half, boolean>>({ light: false, dark: false });
	let selectValue = $state<Record<Half, string>>({ light: 'b', dark: 'b' });
	let tab = $state<Record<Half, string>>({ light: 'one', dark: 'one' });
	let page = $state<Record<Half, number>>({ light: 3, dark: 3 });
	let radio = $state<Record<Half, string>>({ light: 'a', dark: 'a' });
	let shellOpen = $state<Record<Half, boolean>>({ light: false, dark: false });
	let search = $state<Record<Half, string>>({ light: 'invoice', dark: 'invoice' });

	const selectItems: SelectItem[] = [
		{ value: 'a', label: 'Option A' },
		{ value: 'b', label: 'Option B' },
		{ value: 'c', label: 'Disabled', disabled: true }
	];
	const navGroups: SidebarNavGroup[] = [
		{
			label: 'Main',
			items: [
				{ label: 'Dashboard', href: '#', active: true },
				{ label: 'Inbox', href: '#', badge: '4' }
			]
		},
		{ items: [{ label: 'Settings', href: '#' }] }
	];
	const people = [
		{ name: 'Ayu Lestari', role: 'Engineer', status: 'success' as const },
		{ name: 'Budi Santoso', role: 'Designer', status: 'warning' as const }
	];
</script>

<Toaster />

<TooltipProvider>
	<div class="grid gap-0 lg:grid-cols-2">
		{#each halves as half (half)}
			<div
				data-theme={half === 'dark' ? 'dark' : undefined}
				class="bg-background p-6 text-foreground"
				data-showcase={half}
			>
				<Stack gap="xl">
					<h1 class="font-display text-2xl font-semibold">Stery kit ({half})</h1>

					<!-- Actions -->
					<section aria-labelledby="actions-{half}">
						<h2 id="actions-{half}" class="mb-3 text-lg font-semibold">Actions</h2>
						<Stack gap="sm">
							<Stack direction="row" gap="sm" wrap>
								<Button>Primary</Button>
								<Button variant="secondary">Secondary</Button>
								<Button variant="outline">Outline</Button>
								<Button variant="ghost">Ghost</Button>
								<Button variant="destructive">Destructive</Button>
								<Button variant="link">Link</Button>
							</Stack>
							<Stack direction="row" gap="sm" align="center" wrap>
								<Button size="sm">Small</Button>
								<Button size="md">Medium</Button>
								<Button size="lg">Large</Button>
								<Button size="icon" aria-label="Add">+</Button>
								<Button loading>Saving</Button>
								<Button disabled>Disabled</Button>
								<Button href="#">As link</Button>
							</Stack>
							<ButtonGroup>
								<Button variant="outline">Day</Button>
								<Button variant="outline">Week</Button>
								<Button variant="outline">Month</Button>
							</ButtonGroup>
						</Stack>
					</section>

					<!-- Forms -->
					<section aria-labelledby="forms-{half}">
						<h2 id="forms-{half}" class="mb-3 text-lg font-semibold">Forms</h2>
						<Stack gap="md">
							<FormField label="Name" description="As on your ID." required>
								{#snippet children({ id, describedBy, invalid })}
									<Input {id} placeholder="Full name" {invalid} aria-describedby={describedBy} />
								{/snippet}
							</FormField>
							<FormField label="Email" error="Enter a valid email.">
								{#snippet children({ id, describedBy, invalid })}
									<Input {id} type="email" value="nope" {invalid} aria-describedby={describedBy} />
								{/snippet}
							</FormField>
							<Stack direction="row" gap="sm">
								<Input size="sm" placeholder="Small" />
								<Input size="lg" placeholder="Large" />
							</Stack>
							<div>
								<Label for="notes-{half}">Notes</Label>
								<Textarea id="notes-{half}" rows={2} placeholder="Write something" />
							</div>
							<NativeSelect aria-label="Native select">
								<option>First</option>
								<option>Second</option>
							</NativeSelect>
							<Select items={selectItems} bind:value={selectValue[half]} name="choice-{half}" />
							<Select items={selectItems} value="" placeholder="Invalid select" invalid />
							<SearchInput bind:value={search[half]} placeholder="Search" />
							<Stack direction="row" gap="md" align="center" wrap>
								<Checkbox checked>Checked</Checkbox>
								<Checkbox>Unchecked</Checkbox>
								<Checkbox indeterminate>Mixed</Checkbox>
								<Checkbox invalid>Invalid</Checkbox>
								<Switch checked>On</Switch>
								<Switch>Off</Switch>
							</Stack>
							<RadioGroup bind:value={radio[half]}>
								<RadioGroupItem value="a">Radio A</RadioGroupItem>
								<RadioGroupItem value="b">Radio B</RadioGroupItem>
							</RadioGroup>
						</Stack>
					</section>

					<!-- Data display -->
					<section aria-labelledby="data-{half}">
						<h2 id="data-{half}" class="mb-3 text-lg font-semibold">Data display</h2>
						<Stack gap="md">
							<Table>
								<TableCaption>Team</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead sort="asc">Name</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{#each people as person, i (person.name)}
										<TableRow selected={i === 0}>
											<TableCell>{person.name}</TableCell>
											<TableCell>{person.role}</TableCell>
											<TableCell><Badge tone={person.status}>{person.status}</Badge></TableCell>
										</TableRow>
									{/each}
								</TableBody>
							</Table>
							<Table>
								<TableBody>
									<TableLoading columns={3} rows={2} />
								</TableBody>
							</Table>
							<Table>
								<TableBody>
									<TableEmpty colspan={3}>No rows</TableEmpty>
								</TableBody>
							</Table>
							<Stack direction="row" gap="sm" wrap>
								<Card class="w-56">
									<CardHeader>
										<CardTitle>Default card</CardTitle>
										<CardDescription>With shadow</CardDescription>
									</CardHeader>
									<CardContent>Body</CardContent>
									<CardFooter><Button size="sm">Action</Button></CardFooter>
								</Card>
								<Card variant="outline" class="w-40"><CardContent>Outline</CardContent></Card>
								<Card variant="muted" class="w-40"><CardContent>Muted</CardContent></Card>
							</Stack>
							<Stack direction="row" gap="sm" wrap>
								<Badge>Neutral</Badge>
								<Badge tone="info">Info</Badge>
								<Badge tone="success">Success</Badge>
								<Badge tone="warning">Warning</Badge>
								<Badge tone="destructive">Destructive</Badge>
								<Badge tone="success" outline>Outline</Badge>
							</Stack>
							<Stack direction="row" gap="sm" align="center">
								<Avatar name="Ayu Lestari" size="sm" />
								<Avatar name="Budi Santoso" />
								<Avatar name="Citra" size="lg" />
								<Avatar src="/missing.png" name="Fallback" />
								<AvatarGroup items={[{ name: 'Ayu Lestari' }, { name: 'Budi' }, { name: 'Citra' }, { name: 'Dewi' }, { name: 'Eka' }]} max={3} />
							</Stack>
							<Stack direction="row" gap="sm" wrap>
								<StatCard label="Revenue" value={formatCurrency(1250000)} delta="+12%" trend="up" hint="vs last month" />
								<StatCard label="Refunds" value="8" delta="-3%" trend="down" />
								<StatCard label="Orders" value="142" />
							</Stack>
							<DescriptionList items={[{ term: 'Joined', description: formatDate('2024-03-01') }, { term: 'Last seen', description: formatRelativeTime(new Date(Date.now() - 3 * 3600_000)) }]} />
							<DescriptionList layout="horizontal" items={[{ term: 'Plan', description: 'Pro' }, { term: 'Seats', description: 12 }]} />
							<Stack gap="sm">
								<Progress value={65} />
								<Progress value={40} tone="success" size="sm" />
								<Progress value={80} tone="warning" size="lg" />
								<Progress indeterminate tone="info" />
							</Stack>
							<Separator />
							<Accordion type="single" value="one">
								<AccordionItem value="one">
									<AccordionTrigger>First section</AccordionTrigger>
									<AccordionContent>Content of the first section.</AccordionContent>
								</AccordionItem>
								<AccordionItem value="two">
									<AccordionTrigger>Second section</AccordionTrigger>
									<AccordionContent>Content of the second section.</AccordionContent>
								</AccordionItem>
							</Accordion>
						</Stack>
					</section>

					<!-- Feedback -->
					<section aria-labelledby="feedback-{half}">
						<h2 id="feedback-{half}" class="mb-3 text-lg font-semibold">Feedback</h2>
						<Stack gap="sm">
							<Alert title="Neutral" description="Plain notice." />
							<Alert tone="info" title="Info" description="Something to know." />
							<Alert tone="success" title="Success" description="Saved." />
							<Alert tone="warning" title="Warning" description="Stock is low." dismissible />
							<Alert tone="destructive" title="Error" description="Request failed." />
							<Stack direction="row" gap="sm" align="center">
								<Spinner size="sm" />
								<Spinner />
								<Spinner size="lg" />
							</Stack>
							<Skeleton class="h-4 w-48" />
							<Skeleton class="h-10 w-full" />
							<EmptyState title="Nothing here yet" description="Create your first item.">
								{#snippet action()}<Button size="sm">Create</Button>{/snippet}
							</EmptyState>
							<Stack direction="row" gap="sm" wrap>
								<Button size="sm" variant="outline" onclick={() => toast.success('Saved')}>Success toast</Button>
								<Button size="sm" variant="outline" onclick={() => toast.error('Failed', { description: 'Try again.' })}>Error toast</Button>
								<Button size="sm" variant="outline" onclick={() => toast.info('FYI')}>Info toast</Button>
								<Button size="sm" variant="outline" onclick={() => toast.warning('Careful')}>Warning toast</Button>
							</Stack>
						</Stack>
					</section>

					<!-- Overlays -->
					<section aria-labelledby="overlays-{half}">
						<h2 id="overlays-{half}" class="mb-3 text-lg font-semibold">Overlays</h2>
						<Stack direction="row" gap="sm" wrap>
							<Dialog>
								<DialogTrigger>
									{#snippet child({ props })}<Button variant="outline" {...props}>Dialog</Button>{/snippet}
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit profile</DialogTitle>
										<DialogDescription>Update your details.</DialogDescription>
									</DialogHeader>
									<Input aria-label="Name" placeholder="Name" />
									<DialogFooter><Button>Save</Button></DialogFooter>
								</DialogContent>
							</Dialog>
							<Button variant="destructive" onclick={() => (confirmOpen[half] = true)}>Confirm dialog</Button>
							<ConfirmDialog
								bind:open={confirmOpen[half]}
								title="Delete item?"
								description="This cannot be undone."
								confirmLabel="Delete"
								tone="destructive"
							/>
							<Sheet>
								<SheetTrigger>
									{#snippet child({ props })}<Button variant="outline" {...props}>Sheet</Button>{/snippet}
								</SheetTrigger>
								<SheetContent side="right">
									<SheetHeader>
										<SheetTitle>Filters</SheetTitle>
										<SheetDescription>Narrow the list.</SheetDescription>
									</SheetHeader>
								</SheetContent>
							</Sheet>
							<Popover>
								<PopoverTrigger>
									{#snippet child({ props })}<Button variant="outline" {...props}>Popover</Button>{/snippet}
								</PopoverTrigger>
								<PopoverContent>Anchored panel content.</PopoverContent>
							</Popover>
							<DropdownMenu>
								<DropdownMenuTrigger>
									{#snippet child({ props })}<Button variant="outline" {...props}>Menu</Button>{/snippet}
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem>Edit</DropdownMenuItem>
									<DropdownMenuCheckboxItem checked>Pinned</DropdownMenuCheckboxItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Tooltip>
								<TooltipTrigger>
									{#snippet child({ props })}<Button variant="ghost" {...props}>Tooltip</Button>{/snippet}
								</TooltipTrigger>
								<TooltipContent>Helpful hint</TooltipContent>
							</Tooltip>
						</Stack>
					</section>

					<!-- Navigation -->
					<section aria-labelledby="nav-{half}">
						<h2 id="nav-{half}" class="mb-3 text-lg font-semibold">Navigation</h2>
						<Stack gap="md">
							<Tabs bind:value={tab[half]}>
								<TabsList>
									<TabsTrigger value="one">One</TabsTrigger>
									<TabsTrigger value="two">Two</TabsTrigger>
								</TabsList>
								<TabsContent value="one">First panel</TabsContent>
								<TabsContent value="two">Second panel</TabsContent>
							</Tabs>
							<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Staff', href: '#' }, { label: 'Ayu' }]} />
							<Pagination bind:page={page[half]} total={120} perPage={10} />
							<Navbar aria-label="Demo navbar">
								{#snippet brand()}<strong>Stery</strong>{/snippet}
								{#snippet nav()}<a href="/" class="text-sm">Home</a>{/snippet}
								{#snippet actions()}<Button size="sm">Sign in</Button>{/snippet}
							</Navbar>
							<SidebarNav groups={navGroups} class="w-56" />
							<PageHeader title="Staff" description="Everyone in your company.">
								{#snippet breadcrumbs()}<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Staff' }]} />{/snippet}
								{#snippet actions()}<Button>Invite</Button>{/snippet}
							</PageHeader>
							<FilterBar>
								{#snippet search()}<SearchInput placeholder="Search staff" />{/snippet}
								{#snippet filters()}<NativeSelect aria-label="Status"><option>All</option></NativeSelect>{/snippet}
								{#snippet actions()}<Button variant="outline">Export</Button>{/snippet}
							</FilterBar>
							<div class="h-64 overflow-hidden rounded-lg border border-border">
								<AppShell bind:open={shellOpen[half]} class="min-h-0">
									{#snippet sidebar()}<SidebarNav groups={navGroups} class="p-3" />{/snippet}
									{#snippet header()}<strong>App shell</strong>{/snippet}
									Main content
								</AppShell>
							</div>
						</Stack>
					</section>

					<!-- Layout -->
					<section aria-labelledby="layout-{half}">
						<h2 id="layout-{half}" class="mb-3 text-lg font-semibold">Layout</h2>
						<Stack gap="sm">
							<Stack direction="row" gap="xs" justify="between" align="center" class="rounded-md bg-muted p-2">
								<span>Row</span><span>between</span><span>items</span>
							</Stack>
							<Container size="sm" class="rounded-md border border-dashed border-border py-2">
								Container sm
							</Container>
						</Stack>
					</section>
				</Stack>
			</div>
		{/each}
	</div>
</TooltipProvider>
