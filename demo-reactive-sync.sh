#!/bin/bash
# ════════════════════════════════════════════════════════════════════════════════
# Reactive Arrays Demo - Real-Time Sync Across Multiple Clients
# ════════════════════════════════════════════════════════════════════════════════
#
# This script demonstrates how @stateful arrays automatically sync across
# multiple connected clients without any boilerplate code.
#
# Usage:
#   ./demo-reactive-sync.sh
#
# Then follow the instructions to open multiple terminals
# ════════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear_line() {
  echo -ne "\r\033[K"
}

print_header() {
  echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"
}

print_step() {
  echo -e "${CYAN}→${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check if photon CLI is available
if ! command -v photon &> /dev/null; then
  echo -e "${RED}Error: photon CLI not found${NC}"
  echo "Make sure Photon is installed and in your PATH"
  exit 1
fi

print_header "Reactive Arrays Demo: Real-Time Sync"

echo "This demo shows how @stateful arrays automatically sync across multiple clients."
echo ""
echo "The todo.photon.ts demonstrates this pattern:"
echo "  • Declare: items: Task[] = []"
echo "  • Mark: @stateful"
echo "  • That's it! Mutations auto-sync to all clients"
echo ""

read -p "Press Enter to start the demo..."
clear

print_header "Setup: Creating a Shared Todo List"

INSTANCE_NAME="demo-$(date +%s)"

print_step "Creating instance: ${CYAN}${INSTANCE_NAME}${NC}"
print_step "Location: ${CYAN}~/.photon/state/todo/${INSTANCE_NAME}.json${NC}"
echo ""

# Initialize with one item
print_step "Adding first item..."
RESULT=$(photon cli todo _use "$INSTANCE_NAME" add --title "Buy groceries" --priority high 2>/dev/null || echo "")
if [ -z "$RESULT" ]; then
  print_warning "Could not add item (photon might not be running)"
  echo ""
  echo "To see the full demo:"
  echo "  1. Start photon server: ${CYAN}photon beam${NC}"
  echo "  2. Run this script again"
  exit 0
fi
print_success "Item added"

echo ""
print_header "Demo Instructions"

echo -e "${GREEN}Open 3 new terminals and follow these steps:${NC}"
echo ""

echo -e "${YELLOW}Terminal A (Viewer 1):${NC}"
echo "  ${CYAN}photon cli todo _use $INSTANCE_NAME main${NC}"
echo "  (You'll see a live-updating list)"
echo ""

echo -e "${YELLOW}Terminal B (Viewer 2):${NC}"
echo "  ${CYAN}photon cli todo _use $INSTANCE_NAME main${NC}"
echo "  (Same list, stays in sync)"
echo ""

echo -e "${YELLOW}Terminal C (Modifier):${NC}"
echo "  Run these commands one at a time and watch Terminals A & B update instantly:"
echo ""
echo "    # Add items"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME add --title \"Buy milk\"${NC}"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME add --title \"Fix bug\" --priority high${NC}"
echo ""
echo "    # Get an ID (from the output above)"
echo "    ID=\"<copy-id-from-above>\""
echo ""
echo "    # Toggle task"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME toggle --id \$ID${NC}"
echo ""
echo "    # Change priority"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME setPriority --id \$ID --priority low${NC}"
echo ""
echo "    # See stats"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME stats${NC}"
echo ""
echo "    # Clear completed"
echo "    ${CYAN}photon cli todo _use $INSTANCE_NAME clear${NC}"
echo ""

echo -e "${GREEN}What you'll observe:${NC}"
echo "  1. Terminals A & B update ${YELLOW}instantly${NC} (no refresh needed)"
echo "  2. New items appear in both viewers as soon as added"
echo "  3. Checkmarks and priorities update in real-time"
echo "  4. Completion counts change immediately"
echo ""

echo -e "${GREEN}Why this works:${NC}"
echo "  • The todo photon declares: ${CYAN}@stateful items: Task[] = []${NC}"
echo "  • Methods just mutate the array: ${CYAN}this.items.push(task)${NC}"
echo "  • Runtime detects mutations and broadcasts to all clients"
echo "  • No explicit event emitting code needed"
echo "  • No manual UI update code needed"
echo ""

echo -e "${YELLOW}Ready? Open 3 terminals and follow the instructions above.${NC}"
echo ""

read -p "Press Enter when you're done exploring..."

print_header "Understanding the Architecture"

echo "Here's what happened behind the scenes:"
echo ""
echo "┌─ Photon (Business Logic) ─────────────────────┐"
echo "│ items: Task[] = []                            │  ← Just declare"
echo "│                                               │"
echo "│ add(title) {                                  │"
echo "│   this.items.push(task)  ← Mutate array       │"
echo "│ }                                             │"
echo "└───────────────────────────────────────────────┘"
echo "              ↓"
echo "┌─ Runtime (Automatic) ─────────────────────────┐"
echo "│ • Detects: Array mutation                     │"
echo "│ • Emits: items:added event                    │"
echo "│ • Broadcasts: To all connected clients        │"
echo "│ • Persists: To ~/.photon/state/todo/*.json   │"
echo "└───────────────────────────────────────────────┘"
echo "              ↓"
echo "┌─ Connected Clients ───────────────────────────┐"
echo "│ • Terminal A: Updates display                 │"
echo "│ • Terminal B: Updates display                 │"
echo "│ • Beam UI: Updates dashboard                  │"
echo "│ • Claude Desktop: Sees new data               │"
echo "└───────────────────────────────────────────────┘"
echo ""

echo -e "${GREEN}Key insight:${NC} You don't write synchronization code."
echo "You write: ${CYAN}business logic (what to do)${NC}"
echo "Runtime provides: ${CYAN}sync, persistence, events${NC}"
echo ""

print_success "Demo complete! Check out REACTIVE_ARRAYS_TUTORIAL.md for more details."
echo ""
