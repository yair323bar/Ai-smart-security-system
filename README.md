# AI Smart Security System

A full-stack web application for uploading videos and detecting violent content using an AI model.

---

## What the System Does

1. Users register and log in
2. An authenticated user uploads a video file
3. The user previews the video and clicks **Analyze Video**
4. The system sends the video to an AI model (Python FastAPI) that detects violent content
5. The result — **Violence Detected** or **No Violence Detected** — is displayed and saved
6. Users can view their full analysis history with clickable video links
7. Admin users can manage all registered users (roles, blocking, deletion) and view any user's history

---

## Features

- User registration with validation (age 18+, email format, password confirmation)
- Login with JWT authentication
- Video upload with drag & drop support and optional custom name
- AI-powered violence detection per uploaded video
- Personal history page — results shown as Yes / No / No analysis performed
- Videos are kept after analysis and accessible via a clickable link in history
- Admin panel: manage users, change roles, block/unblock, delete, view history

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| File Upload | Multer |
| Auth | JWT |
| AI Service | Python, FastAPI, PyTorch (MViT model) |

---

## Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB (installed via Homebrew)
- The AI model folder: `SmartSecurity_API_Release` (provided separately)

---

## First-Time Setup

### 1. Install Node dependencies

```bash
npm run install:server
npm run install:client
```

### 2. Install Python dependencies (AI model)

```bash
pip3 install -r /path/to/SmartSecurity_API_Release/requirements.txt
```

### 3. Create environment file

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set a value for `JWT_SECRET`.

---

## Running the Project

Open **4 terminal windows**:

**Terminal 1 — MongoDB:**
```bash
brew services start mongodb-community
```

**Terminal 2 — Node.js server:**
```bash
cd /path/to/Ai-smart-security-system && npm run dev:server
```

**Terminal 3 — React frontend:**
```bash
cd /path/to/Ai-smart-security-system && npm run dev:client
```

**Terminal 4 — Python AI API:**
```bash
cd /path/to/SmartSecurity_API_Release && python3 api.py
```

Open the app at: **http://localhost:5173**

---

## AI Model Integration

The AI model runs as a separate Python FastAPI service on port 8000.

The Node.js backend sends the uploaded video file path to the AI API:

**Request:**
```json
POST http://localhost:8000/analyze
{ "source": "/absolute/path/to/uploads/video.mp4" }
```

**Response:**
```json
{ "is_violent": false, "total_clips": 4, "status": "success" }
```

---

## Database Structure

**users**
| Field | Type | Description |
|-------|------|-------------|
| firstName | String | |
| lastName | String | |
| age | Number | Must be 18 or older |
| email | String | Unique, validated |
| username | String | Unique |
| passwordHash | String | Hashed with scrypt |
| role | String | `user` or `admin` |
| status | String | `active` or `blocked` |

**videos**
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to the user |
| displayName | String | Custom name or original filename |
| originalName | String | Original filename |
| fileName | String | Saved filename on disk |
| path | String | Full path used by the AI model |
| analysisStatus | String | `null` or `failed` |

**analysisresults**
| Field | Type | Description |
|-------|------|-------------|
| videoId | ObjectId | Reference to the analyzed video |
| isViolent | Boolean | Result from the AI model |

---

## Project Structure

```
Ai-smart-security-system/
├── client/
│   └── src/
│       ├── components/
│       │   └── Navbar.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Upload.jsx
│       │   ├── VideoPreview.jsx
│       │   ├── History.jsx
│       │   └── Admin.jsx
│       ├── App.jsx
│       └── styles.css
└── server/
    └── src/
        ├── config/db.js
        ├── middleware/auth.middleware.js
        ├── models/
        │   ├── User.js
        │   ├── Video.js
        │   └── AnalysisResult.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── video.routes.js
        │   └── admin.routes.js
        ├── services/ai.service.js
        └── index.js
```

---

## Notes

- The first registered user automatically becomes **admin**
- Blocked users cannot log in
- Videos are stored on disk after analysis and accessible via history
- Replaced videos (uploaded but not analyzed) do not appear in history
- The admin can view the history of any user through the Admin panel

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection refused | Run `brew services start mongodb-community` |
| AI analysis failed | Make sure `python3 api.py` is running on port 8000 |
| Port 5001 in use | Kill the process using that port and restart the server |
| Video not showing in upload | Make sure the file has a video extension (.mp4, .avi, etc.) |

---

## Team

**Full-Stack Team**
- Yuval Sucar
- Yair Bar
- Shoham Ifragen
- Gilad Ben Moshe

**AI Model Team**
- Violence detection model using MViT (Multiscale Vision Transformers)
- Provided as FastAPI service
