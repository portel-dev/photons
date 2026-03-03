# Reactive Arrays: Complete Event Flow Reference

This document details exactly what happens when you mutate a `@stateful` array in Photon.

## The Complete Flow

### Example: Adding a Task

```
User runs:  photon cli todo _use shopping-list add --title "Buy milk"
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: CLI Parses Command                                      │
│ ─────────────────────────────────────────────────────────────── │
│ Command:  todo.add({ title: "Buy milk", priority: "medium" })  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Photon Method Executes                                  │
│ ─────────────────────────────────────────────────────────────── │
│ add(params: { title: string; priority?: string }) {             │
│   const task = {                                                │
│     id: crypto.randomUUID(),          // "abc-123"              │
│     title: "Buy milk",                                          │
│     priority: "medium",                                         │
│     done: false,                                                │
│     createdAt: "2026-03-03T02:25:10Z"                          │
│   };                                                            │
│                                                                 │
│   this.items.push(task);  ← MUTATION DETECTED                  │
│                           ← TRIGGERS EVENT                     │
│   return task;                                                  │
│ }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Runtime Detects Mutation                                │
│ ─────────────────────────────────────────────────────────────── │
│ • Detected: Array.push() on @stateful property                  │
│ • Type: INSERT / ADD                                            │
│ • Property: items                                               │
│ • Change: 1 new element                                         │
│ • Timestamp: 2026-03-03T02:25:10Z                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Runtime Emits Event                                     │
│ ─────────────────────────────────────────────────────────────── │
│ {                                                               │
│   type: 'array-mutation',                                       │
│   property: 'items',                                            │
│   operation: 'push',                                            │
│   data: {                                                       │
│     id: 'abc-123',                                              │
│     title: 'Buy milk',                                          │
│     priority: 'medium',                                         │
│     done: false,                                                │
│     createdAt: '2026-03-03T02:25:10Z'                          │
│   },                                                            │
│   timestamp: '2026-03-03T02:25:10.456Z'                        │
│ }                                                               │
└────────────────┬───────────────────────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────┐
      │          │          │          │
      ↓          ↓          ↓          ↓
┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│ Persist │ │ Broadcast│ │ Return │ │ Emit to  │
│ to Disk │ │ to Other │ │ to CLI │ │ Listeners│
│         │ │ Clients  │ │        │ │          │
└────┬────┘ └────┬─────┘ └───┬────┘ └────┬─────┘
     │           │           │           │
     ↓           ↓           ↓           ↓
  Write to    Send event  Return JSON  App event
  ~/.photon/  via daemon  to caller    listeners
  state/todo/ (broadcasts              update UI
  shopping    to all      {"id":       (React/Vue/
  -list.json  connected   "abc-123"})  Angular)
              clients
```

## Event Types & Timing

### For Different Array Operations:

| Operation | Event Type | Example |
|-----------|-----------|---------|
| `push(item)` | `items:added` | `this.items.push(task)` |
| `splice(idx, 1)` | `items:removed` | `this.items.splice(0, 1)` |
| `[i].property = value` | `items:changed` | `this.items[0].done = true` |
| `= items.filter()` | `items:replaced` | `this.items = items.filter(t => !t.done)` |
| `items[i] = newTask` | `items:changed` | `this.items[2] = updatedTask` |

## Complete Timeline: Multiple Clients

```
Time  Terminal A (Viewer)    Terminal B (Viewer)    Terminal C (Modifier)
      ─────────────────────  ─────────────────────  ──────────────────────
T=0   Shows: []              Shows: []

T=1                                                  Runs: add "Buy milk"

T=2   Connected, listening   Connected, listening   Method executes:
      for updates            for updates            this.items.push({...})

T=3                                                  Runtime detects mutation
                                                     ↓ Event emitted

T=3.1 Receives: items:added Receives: items:added  Persisted to disk
      Event triggers         Event triggers         ✓ Written to file
      Calls list()           Calls list()           ✓ Ready
      Display updates:       Display updates:
      □ Buy milk             □ Buy milk

T=4   User sees item         User sees item         Returns {id: "abc-123"}
      ✓ Instant             ✓ Instant              to CLI

T=5                                                  Runs: add "Buy bread"

T=5.5                                                this.items.push({...})

T=6   Receives event        Receives event         Mutation detected
      Display updates:      Display updates:       Event emitted
      □ Buy milk            □ Buy milk
      □ Buy bread           □ Buy bread

T=7   User sees             User sees              Persisted
      ✓ Instant            ✓ Instant              ✓ Done

T=8                                                  Runs: toggle "abc-123"

T=8.5                                                this.items[0].done = true

T=9   Receives event        Receives event         Mutation detected
      Display updates:      Display updates:       Event emitted
      ✓ Buy milk (checked)  ✓ Buy milk (checked)
      □ Buy bread           □ Buy bread

T=10  User sees             User sees              Persisted
      ✓ Change instantly   ✓ Change instantly     ✓ Done
```

## Event Listeners: How UIs Hook Into This

### CLI Listener (Built-in)
```typescript
// In photon-core's daemon communication
listener.on('items:added', (event) => {
  console.log(`+ ${event.data.title}`);
  displayUpdatedList();
});

listener.on('items:changed', (event) => {
  console.log(`✓ Updated: ${event.data.title}`);
  displayUpdatedList();
});

listener.on('items:removed', (event) => {
  console.log(`- Removed item`);
  displayUpdatedList();
});
```

### React Component Listener (Custom UI)
```typescript
export function TodoList() {
  const [items, setItems] = useState<Task[]>([]);

  useEffect(() => {
    // Subscribe to the same events!
    const subscription = photon.subscribeToChanges('items', (event) => {
      switch (event.operation) {
        case 'push':
          setItems(prev => [...prev, event.data]);
          break;
        case 'splice':
          setItems(prev => prev.filter(t => t.id !== event.data.id));
          break;
        case 'update':
          setItems(prev => prev.map(t =>
            t.id === event.data.id ? event.data : t
          ));
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Render...
}
```

### Vue Component Listener
```typescript
export default {
  data() {
    return { items: [] };
  },
  mounted() {
    photon.onItemsChange((event) => {
      if (event.operation === 'push') {
        this.items.push(event.data);
      } else if (event.operation === 'splice') {
        this.items = this.items.filter(t => t.id !== event.data.id);
      } else if (event.operation === 'update') {
        this.items = this.items.map(t =>
          t.id === event.data.id ? event.data : t
        );
      }
    });
  }
};
```

## The Key Insight: One Truth Source

```
┌──────────────────────────────────────┐
│ Photon Class                         │
│ ──────────────────────────────────── │
│ @stateful                            │
│ class TodoList {                     │
│   items: Task[] = []  ← TRUTH SOURCE │
│ }                                    │
└────────────┬───────────────────────┘
             │
    ┌────────┴───────────┬────────────┬────────────┐
    │                    │            │            │
    ↓                    ↓            ↓            ↓
┌─────────┐        ┌─────────┐  ┌─────────┐  ┌─────────┐
│   CLI   │        │ Beam UI │  │ Claude  │  │ Custom  │
│ Listens │        │ Listens │  │ Desktop │  │   UI    │
│ to      │        │ to      │  │ Listens │  │ Listens │
│ events  │        │ events  │  │ to      │  │ to      │
│         │        │         │  │ events  │  │ events  │
└─────────┘        └─────────┘  └─────────┘  └─────────┘

All see the SAME events
All see the SAME data
All stay in SYNC

No manual synchronization code needed.
```

## Performance: Why This Is Fast

```
Mutation happens:  this.items.push(task)
                   ↓ (microseconds)
Event created:     { type: 'added', data: {...} }
                   ↓ (milliseconds)
Broadcast begins:  Sent to all connected clients
                   ↓ (milliseconds for network)
Listeners receive: React/Vue/CLI listeners get event
                   ↓ (milliseconds)
UI updates:        Instant re-render/refresh
                   ↓ (simultaneous)
Disk write:        File persisted asynchronously
```

**Net result:** User sees changes in < 100ms across all clients.

## Mutation Detection: How Runtime Knows

Photon's runtime uses a **Proxy-based tracking system**:

```typescript
// What you write:
this.items.push(task);

// What runtime sees:
new Proxy(this.items, {
  set(target, prop, value) {
    // Intercepts: items[0] = newValue
    target[prop] = value;
    emitEvent('items:changed', { data: newValue });
    persistToDisk(target);
    return true;
  },
  deleteProperty(target, prop) {
    // Intercepts: delete items[0]
    const deleted = target[prop];
    delete target[prop];
    emitEvent('items:removed', { data: deleted });
    persistToDisk(target);
    return true;
  }
});
```

So when you do:
- `this.items.push(task)` → Detected as "property modified"
- `this.items[0].done = true` → Detected as "nested property changed"
- `this.items = newArray` → Detected as "property replaced"

All trigger events automatically.

## Network Protocol

When running across machines (Beam, Claude Desktop):

```
Client A                         Daemon                    Client B
(your CLI)                    (mediator)                  (another UI)
   │                              │                            │
   ├──── photon add(...) ────────→│                            │
   │                              │──── emit event ───────────→│
   │                              │                            │
   │←──── done {id, data} ────────┤←─ listener updates ────────┤
   │                              │
   │←──── broadcast event ─────────┴──────────────────────────→│
   │                              │                            │
```

The daemon is the **single source of truth** for:
- Routing events
- Managing connections
- Coordinating updates
- Ensuring consistency

## Summary

| Level | What Happens |
|-------|--------------|
| **Code** | You mutate `this.items` normally |
| **Runtime** | Detects mutation, emits event |
| **Network** | Daemon broadcasts to all clients |
| **Persistence** | File written to disk |
| **UI** | Listeners receive event and update |
| **User** | Sees change instantly across all clients |

**No synchronization boilerplate needed. Just mutate and let the framework handle the rest.**
