# AI Smart Security System

Full-stack web application for uploading security videos, analyzing them with an AI violence detection model, storing the results in MongoDB, and reviewing analysis history through a role-based dashboard.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Video upload: Multer
- AI service: Python FastAPI violence detection API

## Project Structure

```text
ai-smart-security-system/
  client/
    src/
      App.jsx
      styles.css
  server/
    src/
      config/
      middleware/
      models/
      routes/
      services/
      utils/
    uploads/
    .env.example
  README.md
```

## What The System Does

1. A user signs up or logs in.
2. The first registered user automatically becomes `admin`.
3. Authenticated users upload video files from the dashboard.
4. The Node.js backend stores video metadata in MongoDB.
5. The backend sends the uploaded video path to the Python AI API.
6. The AI API returns whether violence was detected.
7. If supported by the AI API, detected violence time ranges are returned and displayed.
8. Results are stored in MongoDB and shown in the dashboard history table.

## Required Local Tools

Install these on every computer that runs the project:

- Node.js 18 or newer
- Python 3.8 or newer
- MongoDB Community Server
- MongoDB Compass, optional but recommended
- Git

MongoDB must be running locally on:

```text
mongodb://127.0.0.1:27017
```

## Initial Setup

Run from the project root:

```bash
npm install --prefix client
npm install --prefix server
```

Create a real backend environment file:

```text
server/.env
```

Copy the content from `server/.env.example` and update the secret:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ai-smart-security-system
JWT_SECRET=replace-with-a-long-random-secret
AI_API_URL=http://localhost:8000/analyze
AI_TIMEOUT_MS=180000
```

If the backend runs on a different port, create:

```text
client/.env
```

```env
VITE_API_URL=http://localhost:5001/api
```

## Connecting The AI Model API

The AI model runs as a separate Python FastAPI service. The Node.js backend does not run the model directly. It sends the uploaded video path to the AI API.

Expected AI API location:

```text
http://localhost:8000/analyze
```

To run the AI API from the extracted release folder:

```powershell
cd C:\Users\<YOUR_USER>\Downloads\SmartSecurity_API_Release\SmartSecurity_API_Release
pip install -r requirements.txt
python api.py
```

The API should print something similar to:

```text
Model loaded on cpu
Uvicorn running on http://0.0.0.0:8000
```

Keep this terminal open while testing video analysis.

## AI API Contract

The backend sends:

```json
{
  "source": "C:/path/to/server/uploads/video.mp4"
}
```

Minimum valid response:

```json
{
  "is_violent": false,
  "total_clips": 2,
  "status": "success"
}
```

Recommended response with time ranges:

```json
{
  "is_violent": true,
  "total_clips": 5,
  "violent_segments": [
    {
      "clip_index": 2,
      "start_second": 6,
      "end_second": 9,
      "confidence": 0.87
    }
  ],
  "status": "success"
}
```

The frontend can show exact timestamps only if the AI API returns `violent_segments` or `violent_clips`.

## Run The Project

Use three terminals.

Terminal 1 - AI API:

```bash
python api.py
```

Terminal 2 - backend:

```bash
npm run dev:server
```

Expected backend output:

```text
[db] Connected to MongoDB
Server is running on http://localhost:5001
```

Terminal 3 - frontend:

```bash
npm run dev:client
```

Open the frontend URL printed by Vite. It is usually:

```text
http://localhost:5173
```

If port `5173` is busy, Vite may use another port such as `5174`.

## Smoke Test

1. Open the frontend in the browser.
2. Sign up with a new user.
3. Confirm that the first user is shown as `admin`.
4. Upload a small `.mp4` test video.
5. Click `Upload & Analyze`.
6. Confirm that the result shows `Violence detected` or `No violence detected`.
7. Open MongoDB Compass and refresh.
8. Confirm that this database was created:

```text
ai-smart-security-system
```

Expected MongoDB collections:

- `users`
- `videos`
- `analysisresults`

## Roles

- `admin`: can use the video analysis dashboard and access the Admin Console.
- `user`: can upload videos and view only their own history.

The first registered user becomes `admin`. Every later user is created with the `user` role.

Admin Console capabilities:

- View all registered users.
- Change another user's role to `user` or `admin`.
- Block or unblock user accounts.
- Delete users and their related uploaded video analysis data.

Blocked users cannot log in. They receive this message:

```text
Your account has been blocked. Please contact the system administrator.
```

## Troubleshooting

MongoDB connection refused:

```text
connect ECONNREFUSED 127.0.0.1:27017
```

MongoDB is not running. Start MongoDB locally or install MongoDB Community Server as a Windows service.

Backend port already in use:

```text
EADDRINUSE: address already in use :::5001
```

Find and stop the process:

```powershell
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

AI analysis failed:

- Make sure the Python API is running.
- Make sure `AI_API_URL=http://localhost:8000/analyze` is set in `server/.env`.
- Make sure the uploaded file path exists.
- Large videos can take several minutes on CPU. Use a short test video first, or increase `AI_TIMEOUT_MS` in `server/.env`.

Frontend cannot reach backend:

- Make sure the backend is running on port `5001`.
- If the backend port changed, update `client/.env`.

## Useful Scripts

From the project root:

```bash
npm run dev:server
npm run dev:client
npm run install:server
npm run install:client
```

Build frontend:

```bash
npm run build --prefix client
```

## Repository

[Ai-smart-security-system](https://github.com/yair323bar/Ai-smart-security-system)
