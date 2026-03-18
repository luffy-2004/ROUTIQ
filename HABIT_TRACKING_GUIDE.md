# 🎯 Habit Tracking Feature - Documentation

## Overview
The Habit Tracking feature enables users to create, monitor, and maintain daily habits with automatic streak counting. All habit data is stored securely in Firestore with subcollections for tracking completions.

## Features

### ✨ Core Features
1. **Create New Habits** - Add habits with name, frequency, description, and emoji icons
2. **Daily Completion Tracking** - Mark habits as completed for each day
3. **Automatic Streak Calculation** - System automatically calculates current streaks
4. **Completion Logs** - Firestore subcollections track every completion
5. **Visual Feedback** - Color-coded cards showing completion status
6. **Statistics** - View total completions, current streak, and frequency

### 🎨 UI Features
- Clean, encouraging interface with emoji icons
- Real-time updates without page refresh
- Responsive grid layout
- Color-coded status indicators (green for completed, gray for pending)
- Icon selector with 10 different emoji options
- Empty state guidance for new users

## File Structure

```
src/
├── pages/
│   └── Habits.jsx                 # Main Habits page component
├── services/
│   └── habitService.js            # Firestore operations & streak logic
├── styles/
│   └── Habits.css                 # Styling for Habits page
├── components/
│   └── Header.jsx                 # Updated with Habits link
└── App.jsx                        # Updated with /habits route
```

## Firestore Database Structure

### Collections
```
habits/
├── [habitId]
│   ├── name: string              # e.g., "Morning Meditation"
│   ├── frequency: string          # daily, weekly, monthly
│   ├── description: string        # Optional description
│   ├── icon: string               # Emoji icon
│   ├── userId: string             # Owner's user ID
│   ├── active: boolean            # true/false for soft deletion
│   ├── createdAt: timestamp       # Creation time
│   ├── updatedAt: timestamp       # Last update time
│   ├── lastCompletedDate: string  # Most recent completion (YYYY-MM-DD)
│   └── completions/ (subcollection)
│       └── [YYYY-MM-DD]
│           └── completedAt: timestamp
```

### Example Document
```javascript
{
  userId: "user123",
  name: "📚 Read Daily",
  frequency: "daily",
  description: "Read for 30 minutes",
  icon: "📚",
  active: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastCompletedDate: "2026-03-01"
}
```

## API Reference

### habitService.js Functions

#### `addHabit(userId, habitData)`
Creates a new habit for a user.

**Parameters:**
- `userId` (string): User's Firebase UID
- `habitData` (object):
  - `name` (string, required): Habit name
  - `frequency` (string, required): 'daily', 'weekly', or 'monthly'
  - `description` (string, optional): Description of the habit
  - `icon` (string, optional): Emoji icon

**Returns:** Promise<object> - Created habit with ID and initial streak: 0

**Example:**
```javascript
const newHabit = await addHabit('user123', {
  name: 'Morning Exercise',
  frequency: 'daily',
  description: '30 minutes of cardio',
  icon: '💪'
});
```

#### `getHabits(userId)`
Fetches all active habits for a user with current streak data.

**Parameters:**
- `userId` (string): User's Firebase UID

**Returns:** Promise<Array> - Array of habit objects with:
- `id`, `name`, `frequency`, `description`, `icon`
- `streak` (number): Current streak count
- `completedToday` (boolean): Whether completed today
- `completionCount` (number): Total completions
- `createdAt`: Creation timestamp

**Example:**
```javascript
const habits = await getHabits('user123');
// Returns: [
//   { id: 'habit1', name: 'Exercise', streak: 12, completedToday: true, ... }
// ]
```

#### `markHabitComplete(userId, habitId)`
Records a habit completion for today.

**Parameters:**
- `userId` (string): User's Firebase UID
- `habitId` (string): ID of the habit to mark complete

**Returns:** Promise<object> - { success: true }

**Example:**
```javascript
await markHabitComplete('user123', 'habit1');
```

#### `unmarkHabitComplete(habitId)`
Removes today's completion record for a habit.

**Parameters:**
- `habitId` (string): ID of the habit

**Returns:** Promise<object> - { success: true }

**Example:**
```javascript
await unmarkHabitComplete('habit1');
```

#### `deleteHabit(habitId)`
Soft-deletes a habit (sets active: false).

**Parameters:**
- `habitId` (string): ID of the habit to delete

**Returns:** Promise<object> - { success: true }

**Example:**
```javascript
await deleteHabit('habit1');
```

## Streak Calculation Logic

The streak is calculated based on consecutive daily completions:

```javascript
const calculateStreak = (completions = []) => {
  if (!completions || completions.length === 0) return 0;
  
  // Sort dates in descending order (most recent first)
  const sorted = [...completions].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let currentDate = new Date();
  
  // Check for consecutive days
  for (let i = 0; i < sorted.length; i++) {
    const completionDate = new Date(sorted[i]);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (dates match) streak++;
    else break; // Stop counting on first gap
  }
  
  return streak;
};
```

**Examples:**
- Completed: [2026-03-01, 2026-02-28, 2026-02-27] → Streak: 3
- Completed: [2026-03-01, 2026-02-28, 2026-02-26] → Streak: 2 (gap on 2026-02-27)
- Completed: [] → Streak: 0

## Usage in Components

### Basic Setup
```javascript
import { getHabits, addHabit, markHabitComplete } from '../services/habitService';
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);

  // Fetch habits on mount
  useEffect(() => {
    if (!user?.uid) return;
    const fetchData = async () => {
      const userHabits = await getHabits(user.uid);
      setHabits(userHabits);
    };
    fetchData();
  }, [user?.uid]);

  // Mark habit complete
  const handleComplete = async (habitId) => {
    await markHabitComplete(user.uid, habitId);
    // Refresh habits
    const updated = await getHabits(user.uid);
    setHabits(updated);
  };

  return (
    // Your component JSX
  );
}
```

## Available Habit Icons
Users can choose from 10 predefined emoji icons:
- 📚 (Reading)
- 💪 (Exercise)
- 🧘 (Meditation)
- 🏃 (Running)
- 🥗 (Nutrition)
- 💧 (Hydration)
- 😴 (Sleep)
- 📝 (Writing)
- 🎯 (Goal Setting)
- 🧠 (Learning)

## Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const habit = await addHabit(userId, habitData);
} catch (error) {
  // Handle specific errors
  if (error.message.includes('User ID is required')) {
    // Handle missing user ID
  } else if (error.message.includes('Habit name is required')) {
    // Handle missing habit name
  }
  console.error('Error:', error.message);
}
```

## Performance Considerations

1. **Streak Calculation**: Optimized to break on first gap
2. **Firestore Queries**: Uses indexed queries with userId and active status
3. **Subcollections**: Completion logs stored as subcollections for scalability
4. **Real-time Updates**: Can be enhanced with Firestore listeners for live updates

## Future Enhancements

1. **Notifications**: Push notifications for habit reminders
2. **Statistics Dashboard**: Charts showing completion rates over time
3. **Habit Tags**: Categorize habits (health, productivity, learning, etc.)
4. **Social Features**: Share streaks or compete with friends
5. **Habit Grouping**: Organize related habits together
6. **Custom Reminders**: Set specific times for habit completion
7. **Export Data**: Download habit logs as CSV
8. **Habit Templates**: Pre-built habit templates for users

## Best Practices

1. **Always check user authentication** before making service calls
2. **Handle loading states** while fetching from Firestore
3. **Provide error feedback** to users when operations fail
4. **Refresh data** after completing operations that modify state
5. **Use server timestamps** for accurate creation/update tracking
6. **Soft delete habits** instead of permanent deletion for data integrity

## Troubleshooting

### Habit not updating after marking complete
- Ensure you're refreshing the habits list after marking complete
- Check user ID is being passed correctly
- Verify Firestore has write permissions for the user

### Streak not calculating correctly
- Check completion dates are in YYYY-MM-DD format
- Verify there are no gaps in consecutive days
- Check timezone handling in date calculations

### Habits not loading
- Verify user is authenticated
- Check Firestore database connection
- Ensure collection paths match exactly
- Check browser console for Firestore errors

## Testing

To test the feature:

1. Navigate to `/habits` in the app
2. Click "Add Habit" and create a new habit
3. Select an icon and frequency
4. Click "Create Habit"
5. Click "Mark as Complete" button
6. Verify the card turns green and streak updates
7. Refresh the page to confirm data persists
