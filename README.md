# FocusAI – Smart AI Study Assistant

FocusAI uses your webcam and on-device computer vision to detect signs of drowsiness while you study, alerting you when your focus starts to slip and tracking how attentive you were across a session.

## How It Works

While you study, FocusAI watches your webcam feed (locally, in the browser) using MediaPipe's Face Landmarker to track your eyes. It computes the Eye Aspect Ratio (EAR) frame by frame — a measure of how open or closed your eyes are — and runs it through a timer/threshold state machine to detect sustained eye closure (drowsiness) rather than normal blinking. When drowsiness is detected, it plays an alert sound to snap you back to attention. Each session is logged with an attention score (attentive time vs. total time) so you can review your study history over time.

## Features

- **Live webcam feed** with start/stop controls and clear permission-error handling
- **On-device drowsiness detection** via MediaPipe Face Landmarker + Eye Aspect Ratio (EAR)
- **Configurable audio alerts** — upload your own sound, adjust volume, test playback
- **Study timer** and **attention score** tracking per session
- **Session history** stored in MongoDB and viewable in a dashboard
- **Settings panel** for tuning detection sensitivity and alert preferences

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- MediaPipe Face Landmarker (Tasks Vision)

**Backend**
- Node.js / Express
- MongoDB (via Mongoose)
- Multer for sound file uploads

## Project Structure

```
focusai/
├── frontend/
│   └── src/
│       ├── components/    # Camera, AlertSound, StudyTimer, AttentionScore, etc.
│       ├── ai/             # faceLandmarker.js, eyeAspectRatio.js, eyeTracking.js
│       ├── hooks/          # useCamera.js, useDrowsiness.js
│       ├── pages/          # Dashboard, Settings, History
│       └── services/       # api.js
└── backend/
    ├── app.js
    ├── server.js
    ├── config/             # db.js, multer.js
    ├── models/             # StudySession, UserSettings
    ├── routes/             # sessionRoutes, settingsRoutes, soundRoutes
    └── controllers/
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB instance (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd focusai
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example`):

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, with the API running at `http://localhost:5000`.

## Environment Variables

| Variable       | Description                                  |
|----------------|-----------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string                     |
| `PORT`         | Backend server port (default: 5000)          |
| `FRONTEND_URL` | Frontend origin, used for CORS restriction    |

**Never commit your `.env` file.** Use `.env.example` with placeholder values only, and double-check `git status` before pushing to confirm `.env` isn't tracked.

## Security Notes

- MongoDB credentials are loaded from environment variables, never hardcoded
- CORS is restricted to the configured frontend origin
- Uploaded sound files are size-limited via Multer
- All face/eye tracking runs client-side — no video or camera data is sent to the backend

## Roadmap

- [x] Webcam capture with permission handling
- [x] MediaPipe Face Landmarker integration
- [x] EAR-based drowsiness detection
- [x] Configurable audio alerts
- [x] Study timer & attention score
- [x] Express + MongoDB backend
- [ ] Polished dashboard, settings, and history views

## License

This project is licensed under the [MIT License](LICENSE) — see the `LICENSE` file for details.
