# 💬 Chat & Daily Reflections

Routiq now includes a simple chat-style interface where users can write daily
reflections and receive brief AI feedback. All messages are stored in Firestore
so the conversation persists across sessions.

## 🧩 Feature Overview

- Users type their thoughts, feelings, or study reflections into the chat box.
- The app responds immediately with a short motivational message tailored to
  keywords in the user's text (e.g. "tired", "happy", "stress").
- Both user messages and AI replies are saved in the `reflections` collection,
  allowing history to be reloaded on subsequent visits.
- The chat UI uses bubble-style messages for clarity and a familiar experience.

## 🔧 Firestore Schema

```
reflections/
  {autoId} -> {
      userId: string,
      role: 'user' | 'assistant',
      text: string,
      createdAt: timestamp
  }
```

> Firestore rules (see setup document) restrict access to only the owning user.

## 🧪 Service API

Located at `src/services/chatService.js`:

```js
export const getMessages = async (userId) => { ... };    // fetch history
export const addMessage = async (userId, role, text) => { ... }; // persist
export const generateAIReply = (userText) => { ... };     // simple logic
```

The AI response function contains heuristic rules and a fallback list of
generic motivational phrases. This keeps the UX fun without requiring a real
NLP backend.

## 🧠 UI Integration

The chat page (`src/pages/AIChat.jsx`) now:

- Uses `useAuth` to identify the current user.
- Loads existing messages on mount using `getMessages()`.
- When the user sends text:
  1. The message is saved to Firestore.
  2. A reply is generated (via `generateAIReply`) and saved too.
  3. Both messages are appended to local state for immediate display.
- Simple bubble styling distinguishes user vs assistant messages.


### Example usage snippet

```jsx
const { user } = useAuth();
useEffect(() => {
  if (user) getMessages(user.uid).then(setMessages);
}, [user]);

const handleSend = async () => {
  const reply = generateAIReply(input);
  await addMessage(user.uid, 'user', input);
  await addMessage(user.uid, 'assistant', reply);
  setMessages([...messages, {role:'user',text:input}, {role:'assistant',text:reply}]);
};
```

## ✅ Testing Instructions

1. Open the app and sign in.
2. Navigate to **AI Chat** from the header.
3. Enter a reflection like "I'm feeling stressed about tests".
4. Verify the AI responds with a comforting message.
5. Refresh the page; previous conversation should reappear.
6. Inspect Firestore: documents should exist in `reflections` with appropriate
   roles and timestamps.

## 🔒 Security

The Firestore rules only permit a user to read/write messages where
`resource.data.userId === request.auth.uid`. See
`FIRESTORE_RULES_SETUP.md` and `QUICK_FIX_PERMISSIONS.md` for the rule snippets.

## 📈 Future Ideas

- Add sentiment scoring for richer feedback.
- Allow users to export their chat history.
- Integrate with a real AI API for smarter replies.
- Provide daily summary notifications based on reflections.

*Doc generated March 1, 2026.*