# 🤖 AI Workload Analysis

This document describes the new AI-based workload analysis feature added to Routiq. The analysis helps users understand how their current tasks fit into their available time, and stores a daily report in Firestore for later review or analytics.

## 🧠 How It Works

1. **Task Selection**: Only tasks that are due today (or have no due date) are considered. This ensures the analysis reflects the user's immediate workload.
2. **Estimation Aggregation**: The `estimatedTime` field of each task is summed to compute the total required minutes for the day.
3. **Availability Comparison**: The total is compared to the user's daily available time. This value is read from the `users/{userId}` document under `dailyAvailableMinutes` (editable via the Profile page using hours/minutes). If the setting is missing, the system assumes a default of 480 minutes (8 hours).
4. **Classification**:
   - **easy**: total ≤ 50% of available time
   - **doable**: total ≤ 100% of available time
   - **overloaded**: total > available time
5. **Motivational Message**: A short friendly message is generated based on the classification.
6. **Persistence**: A report object is written to a new `ai_reports` collection in Firestore. Each document contains:
   - `userId`, `date` (YYYY-MM-DD)
   - `totalMinutes`, `availableMinutes`
   - `status` and `message`
   - `createdAt` timestamp

## 📁 Firestore Schema

```text
ai_reports/
  {autoId} -> {
      userId: string,
      date: string,          // today's date
      totalMinutes: number,
      availableMinutes: number,
      status: 'easy'|'doable'|'overloaded',
      message: string,
      createdAt: timestamp
  }
```

> **Note**: You can add additional fields later (e.g. `taskCount`, `notes`).

## 🔧 Service API

The analysis logic lives in `src/services/taskService.js`:

```js
// asynchronous helper that also persists the report
export const analyzeWorkload = async (userId, tasks) => { ... }
```

Usage example (see `Dashboard.jsx`):

```jsx
const [workloadInfo, setWorkloadInfo] = useState({...});
useEffect(() => {
  if (user?.uid) {
    analyzeWorkload(user.uid, tasks).then(setWorkloadInfo);
  }
}, [tasks, user?.uid]);
```

No additional setup is required in the UI; the dashboard automatically re‑runs analysis whenever the task list changes.

## 🔐 Security Rules

Add the following snippet to your Firestore rules (see `FIRESTORE_RULES_SETUP.md`):

```firestore
// AI workload reports - one document per day per user
match /ai_reports/{reportId} {
  allow read, write: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
}
```

This ensures users can only access their own reports.

## ✅ Testing

1. Sign in with a test account.
2. Add several tasks with estimated times and due dates today.
3. Observe the AI card on the dashboard update after the task list refreshes.
4. Open Firebase Console and verify a new document appears in `ai_reports` for the current date.
5. Change `dailyAvailableMinutes` in the user doc (or via the new **Profile** page under Settings) and refresh; the classification should adjust accordingly.

## 🏁 Future Enhancements

- Provide a settings screen where users can edit `dailyAvailableMinutes`.
- Show a history graph of past workload reports.
- Use machine learning models to predict task duration more accurately.
- Surface the report data in the mobile app or email summaries.


---
*Documentation generated March 1, 2026.*
