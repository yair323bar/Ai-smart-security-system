# AI Smart Security System

Local full-stack project for video upload, review, and AI-based violence
analysis.

## Tech Stack

- React
- Node.js
- Express
- MongoDB

## Project Structure

```text
ai-smart-security-system/
├── client/
├── server/
└── README.md
```

## Installation

Run these commands from the project root:

```bash
npm install --prefix client
npm install --prefix server
```

## Run Locally

Start the backend server:

```bash
npm run dev --prefix server
```

Start the frontend in a second terminal:

```bash
npm run dev --prefix client
```

Default local addresses:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Environment

Create a `.env` file inside `server/` based on `server/.env.example`.

Example:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ai-smart-security-system
JWT_SECRET=replace-with-a-long-random-secret
AI_API_URL=http://localhost:8000/analyze
```

For the frontend, create `client/.env` if the backend URL is different:

```env
VITE_API_URL=http://localhost:5001/api
```

## Main Flow

1. A user signs up or logs in.
2. The user uploads a video from the dashboard.
3. The Node.js server stores the video metadata in MongoDB.
4. The server calls the Python AI API at `/analyze`.
5. The analysis result is stored in MongoDB and displayed in the dashboard.

The expected AI response can include violent time ranges:

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

## MongoDB Collections

- `users` - authentication, status, and role permissions.
- `videos` - uploaded video metadata and processing status.
- `analysisresults` - AI result, violence flag, total clips, and detected time ranges.

The first registered user becomes `admin`. Additional users are created with the `user` role.

## Repository

[Ai-smart-security-system](https://github.com/yair323bar/Ai-smart-security-system)
