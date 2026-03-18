# 🎯 HABIT TRACKING SYSTEM - VISUAL ARCHITECTURE

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROUTIQ APPLICATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌──────────────────────────────────┐  │
│  │   NAVIGATION        │         │      ROUTING (App.jsx)           │  │
│  ├─────────────────────┤         ├──────────────────────────────────┤  │
│  │ • Dashboard         │         │ /habits → Habits Component       │  │
│  │ • Add Task          │         │         ↓                        │  │
│  │ • Habits ⭐ NEW    │         │ Protected Route (Auth required)  │  │
│  │ • Progress          │         │         ↓                        │  │
│  │ • AI Chat           │         │ useAuth Hook (User Verified)    │  │
│  │ • Profile           │         │         ↓                        │  │
│  └─────────────────────┘         │ Habits.jsx Component            │  │
│                                  │         ↓                        │  │
│                                  │ habitService.js Functions        │  │
│                                  │         ↓                        │  │
│                                  │ Firestore Database              │  │
│                                  └──────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────┐
│         Habits.jsx (Main Page)           │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐  ┌───────────────┐   │
│  │ Header Sec.  │  │ Form Section  │   │
│  ├──────────────┤  ├───────────────┤   │
│  │ Title        │  │ Icon Selector │   │
│  │ Subtitle     │  │ Name Input    │   │
│  │ Add Button   │  │ Frequency DD  │   │
│  └──────────────┘  │ Description   │   │
│                    │ Submit        │   │
│  ┌────────────────┤───────────────┤   │
│  │                                      │
│  │      Habits Grid (Responsive)       │
│  │      ┌────────────┐┌────────────┐  │
│  │      │ Habit Card ││ Habit Card │  │
│  │      │ 📚 Read    ││ 💪 Exercise │  │
│  │      │ Streak: 12 ││ Streak: 5  │  │
│  │      │ [Mark Btn] ││ [Mark Btn] │  │
│  │      └────────────┘└────────────┘  │
│  │                                      │
│  │  ┌────────────┐┌────────────┐      │
│  │  │ Habit Card ││ Habit Card │      │
│  │  │ 🧘 Meditate││ 🥗 Eat Well│      │
│  │  │ Streak: 3  ││ Streak: 7  │      │
│  │  │ [Mark Btn] ││ [Mark Btn] │      │
│  │  └────────────┘└────────────┘      │
│  │                                      │
│  └────────────────────────────────────┘
│
└──────────────────────────────────────────┘
```

## Data Flow Diagram

```
USER INTERACTION
       │
       ▼
┌─────────────────┐
│  Click Button   │
│  "Add Habit"    │
│  OR             │
│  "Mark Complete"│
└────────┬────────┘
         │
         ▼
    ┌──────────────┐
    │ Event Handler│ (toggleHabitCompletion, handleAddHabit)
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────┐
    │  habitService Functions  │
    │  • addHabit()            │
    │  • markHabitComplete()   │
    │  • getHabits()           │
    │  • deleteHabit()         │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │   Firestore Database     │
    │                          │
    │  habits/ collection      │
    │  ├── document            │
    │  └── completions/        │
    │      subcollection       │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Update/Read Data        │
    │  • Server Timestamps     │
    │  • Auto-increment Streak │
    │  • Add/Remove Logs       │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Streak Calculation      │
    │  calculateStreak()       │
    │  - Sort completions      │
    │  - Count consecutive     │
    │  - Return streak count   │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Update UI State         │
    │  setHabits()             │
    │  setLoading()            │
    │  setError()              │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Re-render Component     │
    │  • Update card colors    │
    │  • Update streak numbers │
    │  • Update button text    │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  User Sees Feedback      │
    │  ✓ Green = Complete      │
    │  ⭐ Streak Updated       │
    │  🔥 Visual Reward        │
    └──────────────────────────┘
```

## Firestore Database Schema

```
┌──────────────────────────────────────────────────────────┐
│                  FIRESTORE DATABASE                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Collection: habits                                     │
│  ├── Document ID: "habit_meditation_001"               │
│  │   ├── name: "🧘 Morning Meditation"                │
│  │   ├── frequency: "daily"                           │
│  │   ├── description: "10 minutes mindfulness"        │
│  │   ├── icon: "🧘"                                  │
│  │   ├── userId: "user_123" (indexed)                │
│  │   ├── active: true (indexed)                       │
│  │   ├── createdAt: Timestamp                         │
│  │   ├── updatedAt: Timestamp                         │
│  │   ├── lastCompletedDate: "2026-03-01"             │
│  │   │                                                 │
│  │   └── Subcollection: completions                   │
│  │       ├── Document ID: "2026-03-01"               │
│  │       │   └── completedAt: Timestamp              │
│  │       ├── Document ID: "2026-02-28"               │
│  │       │   └── completedAt: Timestamp              │
│  │       └── Document ID: "2026-02-27"               │
│  │           └── completedAt: Timestamp              │
│  │                                                     │
│  ├── Document ID: "habit_exercise_002"                │
│  │   ├── name: "💪 Exercise"                         │
│  │   ├── frequency: "daily"                           │
│  │   ├── ... (similar structure)                      │
│  │   │                                                 │
│  │   └── Subcollection: completions                   │
│  │       ├── Document ID: "2026-03-01"               │
│  │       ├── Document ID: "2026-02-28"               │
│  │       └── ... (completion logs)                    │
│  │                                                     │
│  └── Document ID: "habit_reading_003"                 │
│      ├── name: "📚 Read Daily"                       │
│      ├── frequency: "daily"                           │
│      ├── ... (similar structure)                      │
│      │                                                 │
│      └── Subcollection: completions                   │
│          └── Document IDs: [dates of completion]      │
│                                                        │
└──────────────────────────────────────────────────────────┘

INDEXES:
  • habits: userId + active (for efficient queries)
  • completions: organized by date (YYYY-MM-DD)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────┐
│              COMPONENT STATE (React)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  const [habits, setHabits] = useState([])             │
│    ├── Array of habit objects with:                   │
│    │   ├── id, name, icon, frequency                  │
│    │   ├── description, streak, completedToday       │
│    │   └── completionCount                           │
│    │                                                   │
│    └── Updated on:                                    │
│        ├── Component mount (useEffect)                │
│        ├── After adding habit                         │
│        ├── After marking complete                     │
│        └── After deleting habit                       │
│                                                        │
│  const [loading, setLoading] = useState(true)        │
│    └── Shows spinner while fetching data              │
│                                                        │
│  const [error, setError] = useState('')              │
│    └── Displays error messages to user                │
│                                                        │
│  const [showForm, setShowForm] = useState(false)     │
│    └── Toggles form visibility                        │
│                                                        │
│  const [formData, setFormData] = useState({...})     │
│    ├── name: string                                   │
│    ├── frequency: string                              │
│    ├── description: string                            │
│    └── icon: string                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Service Layer Functions

```
┌────────────────────────────────────────────────────────┐
│          HABIT SERVICE (habitService.js)               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. addHabit(userId, habitData)                       │
│     ├── Input: User ID, habit object                  │
│     ├── Process: Validate, add to Firestore           │
│     └── Output: New habit with ID                     │
│                                                        │
│  2. getHabits(userId)                                 │
│     ├── Input: User ID                                │
│     ├── Process:                                      │
│     │   ├── Query Firestore for user's habits         │
│     │   ├── For each habit, fetch completions         │
│     │   ├── Calculate streak                          │
│     │   └── Check if completed today                  │
│     └── Output: Array of habits with streaks          │
│                                                        │
│  3. markHabitComplete(userId, habitId)                │
│     ├── Input: User ID, Habit ID                      │
│     ├── Process:                                      │
│     │   ├── Add document to completions subcollection │
│     │   ├── Use date as document ID (YYYY-MM-DD)      │
│     │   └── Update lastCompletedDate field            │
│     └── Output: Success confirmation                  │
│                                                        │
│  4. unmarkHabitComplete(habitId)                      │
│     ├── Input: Habit ID                               │
│     ├── Process: Delete today's completion document   │
│     └── Output: Success confirmation                  │
│                                                        │
│  5. deleteHabit(habitId)                              │
│     ├── Input: Habit ID                               │
│     ├── Process: Set active field to false            │
│     └── Output: Success confirmation                  │
│                                                        │
│  6. calculateStreak(completions)                      │
│     ├── Input: Array of completion dates              │
│     ├── Process:                                      │
│     │   ├── Sort dates (newest first)                 │
│     │   ├── Check for consecutive days                │
│     │   ├── Stop at first gap                         │
│     │   └── Count streak                              │
│     └── Output: Streak number                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## UI/UX Flow

```
NEW USER JOURNEY:
┌─────────────┐
│ Visit /habits│
└──────┬──────┘
       │
       ▼
┌────────────────┐
│ See empty state│
│ 🌱 No habits  │
└──────┬─────────┘
       │
       ▼
┌──────────────────┐
│ Click "+ Add"    │
│ Form appears     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Fill form:       │
│ • Icon: 📚      │
│ • Name: Read    │
│ • Freq: Daily   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Click Create     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Card appears!    │
│ Shows habit      │
│ Streak: 0       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Complete today   │
│ Click Mark       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Immediate update │
│ ✓ Green card    │
│ Streak: 1 🔥    │
│ Success! 🎉     │
└──────────────────┘


EXISTING USER JOURNEY:
┌─────────────┐
│ Visit /habits│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Load all habits from Firestore
│ Calculate streaks            │
└──────┬──────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Display habit cards:         │
│ • Those completed today: 🟢  │
│ • Those pending: ⚫          │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ User completes habit         │
│ Clicks Mark Complete         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ • Add to Firestore           │
│ • Refresh habits             │
│ • Recalculate streak         │
│ • Update UI                  │
│ • Show success               │
└──────────────────────────────┘
```

## Mobile vs Desktop Layout

```
DESKTOP (1200px+):
┌──────────────────────────────────────────────┐
│ Add Habit [        Card 1         Card 2    │
│           │  Card 3      Card 4   Card 5  │
│           │  Card 6      ...                │
└──────────────────────────────────────────────┘
(3-4 columns)

TABLET (768-1199px):
┌─────────────────────────────┐
│ Add Habit [ Card 1  Card 2  │
│           │ Card 3  Card 4  │
│           │ Card 5  ...     │
└─────────────────────────────┘
(2 columns)

MOBILE (0-767px):
┌──────────────────┐
│ Add Habit        │
│ [ Card 1         │
│ [ Card 2         │
│ [ Card 3         │
│ [ Card 4         │
│ [ Card 5         │
│ [ ...            │
└──────────────────┘
(1 column, full width)
```

## Error Handling Flow

```
┌────────────────┐
│ Operation      │
│ (Add, Mark,    │
│  Delete, etc)  │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Try-Catch      │
│ Block          │
└────────┬───────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌──────┐   ┌─────────────┐
│ Succ │   │ Error       │
│ ess  │   │ Caught      │
└──┬───┘   └──────┬──────┘
   │              │
   ▼              ▼
┌──────┐   ┌─────────────┐
│ Update   │ Check error │
│ State    │ type        │
└──┬───┘   └──────┬──────┘
   │              │
   ▼              ▼
┌──────┐   ┌─────────────┐
│ Show │   │ Display user│
│ Data │   │ friendly msg│
└──────┘   └─────┬───────┘
                  │
                  ▼
            ┌──────────────┐
            │ setError()   │
            │ Show banner  │
            └──────────────┘
```

## Streak Calculation Algorithm

```
INPUT: [2026-03-01, 2026-02-28, 2026-02-27, 2026-02-25, 2026-02-24]
            ↓                                              ↓
          Today                                    Earlier dates

PROCESS:
1. Sort descending (most recent first)
   ✓ Already in order

2. Compare each date with expected consecutive date:
   ┌─────────────────────────────────────────┐
   │ i=0: 2026-03-01 vs Today (2026-03-01)  │ ✓ Match
   │ i=1: 2026-02-28 vs Yesterday (...)     │ ✓ Match
   │ i=2: 2026-02-27 vs 2 days ago (...)    │ ✓ Match
   │ i=3: 2026-02-25 vs 3 days ago (02-27)  │ ✗ MISMATCH - GAP!
   │ BREAK (first gap found)                │
   └─────────────────────────────────────────┘

3. Return streak count: 3

OUTPUT: Streak = 3 (consecutive days)
```

This completes the visual architecture of the Habit Tracking System! 🎯
