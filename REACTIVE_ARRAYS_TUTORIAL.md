# Reactive Arrays: Real-Time Sync Across Clients

This tutorial demonstrates Photon's `@stateful` reactive pattern using the **todo.photon.ts** example. You'll see how multiple clients (CLI, UI, AI assistants) stay in sync with zero boilerplate.

## The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Disk: ~/.photon/state/todo/shopping-list.json              │
│ { items: [ {id, title, priority, done, ...} ] }            │
└────────────────┬────────────────────────────────────────────┘
                 │ [Persisted by runtime]
                 │
        ┌────────┴──────────┐
        │ Daemon (mediator) │  [Broadcasts all mutations]
        └────────┬──────────┘
                 │
    ┌────────────┼────────────┬───────────────┐
    │            │            │               │
  CLI       CLI (another    Beam UI      Claude Desktop
 Terminal   Terminal)    Browser         AI Assistant

 User A     User B         UI Component    Claude
 adds       lists          (React/Vue)     (reads + calls)
 "milk"     items          listens to      methods
            updates        events

 ↓          ↓              ↓                ↓
 items.push() → emit       receives item:added → updates state
 {"milk"..}   item:added   → re-renders instantly
```

## How It Works: Step by Step

### 1️⃣ The Photon (Business Logic)

```typescript
@stateful
export default class TodoList extends PhotonMCP {
  items: Task[] = [];  // ← Just declare it, runtime handles the rest

  add(params: { title: string; priority?: string }) {
    const task = { id: uuid(), title, priority: 'medium', done: false };
    this.items.push(task);  // ← Mutation triggers event
    return task;
  }

  toggle(params: { id: string }) {
    const task = this.items.find(t => t.id === params.id);
    task.done = !task.done;  // ← Mutation triggers event
    return task;
  }
}
```

**That's it.** No event emitting code. Just mutate and move on.

### 2️⃣ Behind the Scenes

When you call `add("Buy milk")`:

```
┌──────────────────────────────────────────────────────────┐
│ 1. Method executes: this.items.push(task)                │
│    Runtime detects: Array mutation detected              │
│                                                          │
│ 2. Runtime emits: { channel: 'items', event: 'added'... }│
│                                                          │
│ 3. Event sent to:                                        │
│    - All connected CLI clients                           │
│    - All browser UIs (via Beam HTTP/SSE)                 │
│    - All Claude Desktop instances                        │
│                                                          │
│ 4. Persisted: ~/.photon/state/todo/shopping-list.json   │
│    (survived restarts)                                   │
│                                                          │
│ 5. All connected UIs update in real-time                 │
└──────────────────────────────────────────────────────────┘
```

## Try It Yourself: Multi-Terminal Demo

### Terminal 1: Client A (Adding items)

```bash
# Start watching the shopping list
photon cli todo _use shopping-list main

# (See empty list with auto-refresh enabled)
```

### Terminal 2: Client B (Also watching)

```bash
# Same instance, same list
photon cli todo _use shopping-list main

# (See same empty list)
```

### Terminal 3: Client C (Modifying)

```bash
# Add an item
photon cli todo _use shopping-list add --title "Buy milk" --priority high

# Add another
photon cli todo _use shopping-list add --title "Buy bread"

# Mark as done
photon cli todo _use shopping-list toggle --id <id-from-above>

# Set priority
photon cli todo _use shopping-list setPriority --id <id> --priority high
```

**Watch Terminal 1 & 2:** They update **instantly** as Terminal 3 makes changes, showing:
- New items appear
- Checkmarks toggle
- Priority badges change
- All without re-connecting or refreshing

### What's Actually Happening

```
Terminal 3: photon cli todo add "Buy milk"
  │
  ├─→ Photon executes: this.items.push({...})
  │
  ├─→ Runtime detects mutation
  │
  ├─→ Emits: { channel: 'items', event: 'added', data: {...} }
  │
  ├─→ Daemon broadcasts to all connected clients
  │
  ├─→ Terminal 1 listens & updates display ✨
  │
  ├─→ Terminal 2 listens & updates display ✨
  │
  └─→ File written: ~/.photon/state/todo/shopping-list.json
```

## Why This Architecture?

| Challenge | Solution |
|-----------|----------|
| **Multiple clients, same data** | `@stateful` syncs all via daemon |
| **Persistence across restarts** | `@stateful` saves to disk automatically |
| **Real-time updates** | Events broadcast instantly to all clients |
| **No boilerplate** | Just mutate arrays normally, runtime handles events |
| **Works everywhere** | CLI, Beam UI, Claude Desktop, custom UIs |

## Real-World Scenario

**AI Assistant helping with task management:**

```typescript
// Claude Desktop runs this
const tasks = await photon.cli('todo', '_use', 'work-project', 'main');
// tasks = [{ title: 'Fix login bug', priority: 'high', done: false }, ...]

await photon.cli('todo', '_use', 'work-project', 'add', {
  title: 'Review PR #42',
  priority: 'high'
});

// ← Instantly visible in:
// - User's CLI terminal
// - User's Beam dashboard
// - Any other AI assistant viewing the project
```

## Building Custom UIs

The same events power all interfaces. Here's how a React component would listen:

```typescript
// Pseudo-code: listening to the same events
export function TodoUI() {
  const [items, setItems] = useState<Task[]>([]);

  useEffect(() => {
    // Listen to events from the photon instance
    const unsubscribe = photon.onEmit('items', (event) => {
      // Same events that CLI listens to!
      if (event.type === 'added') {
        setItems(prev => [...prev, event.data]);
      }
      if (event.type === 'removed') {
        setItems(prev => prev.filter(t => t.id !== event.id));
      }
      if (event.type === 'changed') {
        setItems(prev => prev.map(t =>
          t.id === event.id ? event.data : t
        ));
      }
    });

    return unsubscribe;
  }, []);

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => photon.call('toggle', { id: item.id })}
          />
          <span style={{ opacity: item.done ? 0.5 : 1 }}>
            {item.title}
          </span>
          <select
            value={item.priority}
            onChange={(e) => photon.call('setPriority', {
              id: item.id,
              priority: e.target.value
            })}
          >
            <option>low</option>
            <option>medium</option>
            <option>high</option>
          </select>
        </li>
      ))}
    </ul>
  );
}
```

**The magic:** Custom UI listens to the **exact same events** that the CLI listens to. No extra code in the photon. Just one truth source: the `items` array.

## Key Concepts

### `@stateful` (Mark the class)
```typescript
@stateful
export default class TodoList extends PhotonMCP {
  items: Task[] = [];  // ← This property is now reactive
}
```
- Tells runtime: "Track mutations to class properties"
- Enables: Disk persistence + Event broadcasting

### Named Instances (Organize state)
```bash
photon cli todo _use shopping-list add "milk"
photon cli todo _use work-project add "fix bug"
```
- `shopping-list` and `work-project` are separate instances
- Each has its own `items` array
- Each persisted to: `~/.photon/state/todo/{name}.json`

### Direct Mutations (No boilerplate)
```typescript
this.items.push(task);        // Detects as mutation
this.items[0].done = true;    // Detects as mutation
this.items = items.filter();  // Detects as mutation
```
- No `.set()`, no `.emit()`, no pub/sub setup
- Just use the array like any other JavaScript array
- Runtime automatically broadcasts changes

## Event Flow Diagram

```
User Input (CLI, UI, AI)
         │
         ↓
    Method Call
   (add, toggle, etc)
         │
         ↓
  Mutate this.items
   (push, splice, etc)
         │
         ↓
  Runtime Detects Mutation
    ("items changed!")
         │
         ├──────────────────┬──────────────┬────────────┐
         │                  │              │            │
    Emit Event         Broadcast      Persist    Return to
   to all clients     to Daemon       to Disk    Caller
         │                  │              │            │
         ↓                  ↓              ↓            ↓
     CLI Updates      Other UIs      File Write   Response JSON
    Display          Update          (encrypted)   to caller
     Instantly        Instantly
```

## Understanding the Pattern

This pattern demonstrates **Photon's core philosophy:**

1. **You write:** Business logic (methods that mutate state)
2. **Runtime provides:** Persistence, reactivity, event broadcasting
3. **Result:** Zero boilerplate, maximum clarity

Because `@stateful` handles:
- ✅ Detecting mutations
- ✅ Emitting events
- ✅ Broadcasting to all clients
- ✅ Persisting to disk
- ✅ Managing connections

You focus solely on:
- Business logic
- Data validation
- Method implementation

## Next Steps

1. **Try the multi-terminal demo above** — see real-time sync in action
2. **Build a custom UI** — listen to the same events, render your way
3. **Explore named instances** — organize state by project/context
4. **Scale to multiple users** — daemon handles concurrency automatically

The beauty: **Same mechanism works whether it's 1 user or 100 users, CLI or custom UI, human or AI.**
