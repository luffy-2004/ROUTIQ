# Routiq - Chase Your Goal

An AI-powered habit and task tracking app for students.

## Features

- 📚 **Task Tracking** - Add tasks with estimated time and priority levels
- 🔥 **Habit Tracking** - Build streaks and maintain daily habits
- ⏱️ **Study Time Tracking** - Track your study sessions
- 📊 **Daily Dashboard** - View your progress at a glance
- 🤖 **AI Workload Analysis** - Get feedback on your workload (easy/doable/overloaded)
- 💬 **AI Study Buddy** - Chat with AI for motivational support and study tips
	(now stores history and gives motivational replies)
- 🔐 **Firebase Auth** - Secure email/password authentication
- 👤 **User Profile** - Manage your account settings

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (Login, Dashboard, etc.)
├── services/         # Firebase and API services
├── firebase/         # Firebase configuration
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
├── App.jsx           # Main app component with routing
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Tech Stack

- **React** - UI library with hooks
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Firebase** - Authentication and Firestore database (to be configured)
- **CSS-in-JS** - Inline styles for simplicity

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd Routiq
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Authentication page |
| Dashboard | `/` | Main dashboard with daily progress |
| Add Task | `/add-task` | Create new tasks |
| Progress | `/progress` | View weekly/monthly stats |
| AI Chat | `/chat` | Chat with AI study buddy |
| Profile | `/profile` | User settings and account info |

## Next Steps

1. **Firebase Setup** - Configure Firebase authentication and Firestore
2. **Authentication** - Implement login/signup with Firebase
3. **Task Service** - Connect task management to Firestore
4. **Habit Tracking** - Implement habit streak logic
5. **AI Integration** - Connect AI workload analysis and chat features

## Code Style

- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic
- Organize imports alphabetically

## Contributing

When adding new features:
1. Create components in the appropriate folder
2. Use the existing service pattern
3. Keep styling consistent
4. Update this README if needed

## License

MIT
