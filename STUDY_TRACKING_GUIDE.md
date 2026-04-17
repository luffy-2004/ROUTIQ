# 📘 Study Time Tracking Guide

This document covers the newly implemented study session feature, including API usage, Firestore schema, UI integration, and best practices.

## 🔧 Firestore Structure

```
study_sessions/
  ├── {sessionId}/
  │   ├── userId: string           // owner of the session
  │   ├── subject: string          // topic studied
  │   ├── duration: number         // minutes (frontend form allows hours:minutes input)
  │   ├── reflection: string       // user proof comment
  │   ├── createdAt: timestamp     // session time
```

### Index Recommendation

Queries filter by `userId` and order by `createdAt`.
Firestore requires a composite index if both fields are used together. You can create:

- Collection: `study_sessions`
- Fields: `userId` (Ascending), `createdAt` (Descending)

Either click the link from the console error or create it manually in Firebase Console > Indexes.

## 💼 API Reference (studyService.js)

### `addStudySession(userId, sessionData)`
Creates a new study session.

**Parameters:**
- `userId` (string) - Firebase UID
- `sessionData` (object) with:
  - `subject` (string, required)
  - `duration` (number, minutes, required; form collects hours/minutes)
  - `reflection` (string, optional proof answer)

**Returns:**
Promise resolving to created session object `{ id, subject, duration, reflection }`.

**Example:**
```javascript
await addStudySession('user123', {
  subject: 'Calculus',
  duration: 60,
  reflection: 'Reviewed integrals',
});
```

### `getStudySessions(userId, date)`
Fetch session list for a given day (if `date` provided) or all.
Returns array of sessions sorted by `createdAt` descending.

**Example:**
```javascript
const today = new Date().toISOString().split('T')[0];
const sessions = await getStudySessions('user123', today);
```

### `calculateTotalMinutes(sessions)`
Utility to sum `duration` values from an array of sessions.

### `addReflection(sessionId, reflection)`
Update a session with a reflection comment after it's created.

## 📄 UI Integration (Progress.jsx)

- Added form to record new study session (subject, duration, reflection).
- Display list of today's sessions with reflection text.
- Show progress bar toward daily `DAILY_GOAL_MINUTES` (default 240).
- Daily total computed using `calculateTotalMinutes`.

### Progress Section Structure
1. Error message area
2. Session input form
3. List of sessions (<15 minutes long by default)
4. Progress bar + text showing hours/minutes vs goal

### Example markup snippet
```jsx
<form onSubmit={handleAdd} style={styles.form}>
  <!-- subject, duration, reflection fields -->
</form>
```

## 📘 Dashboard Integration

- Dashboard now fetches today’s study sessions using same service.
- Quick stats section displays completed hours vs target (4h default).

## 🔄 Workflow
1. User logs in.
2. Navigates to My Progress page.
3. Fills out study session form and submits.
4. Session saved to Firestore with timestamp.
5. Reflection field serves as proof/question answer.
6. Total minutes recalculated instantly and UI updates.

## 🛡 Security Rules
Ensure Firestore rules (see `FIRESTORE_RULES_SETUP.md`) include:
```firestore
match /study_sessions/{sessionId} {
  allow read, write: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
}
```

## 🧪 Testing Checklist
- [ ] Add a session and see it appear immediately
- [ ] Reflection text saved properly
- [ ] Total minutes update correctly
- [ ] Progress bar fills according to daily goal
- [ ] Dashboard quick stat updates
- [ ] Permission errors resolved via rules/index

## 📈 Future Enhancements
- Allow users to configure daily goal (via the Profile settings page)
- Add charts for weekly/monthly totals
- Enable timers/stopwatch UI
- Automatically prompt reflection questions based on subject
- Export sessions to CSV

---

> Keep calculations simple: durations in minutes, totals by summing numbers, convert to hours only for display.
