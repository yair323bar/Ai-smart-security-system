# AI Smart Security System

A full-stack web application that allows users to upload videos and detect violent content using an AI model. Built as a final project integrating a violence detection model developed by a separate team.

---

## What the System Does

1. Users register and log in to the system
2. An authenticated user uploads a video file from their computer
3. The user previews the video and clicks **Analyze Video**
4. The system sends the video to an AI model (Python FastAPI) that detects violent content
5. The result — **Violence Detected** or **No Violence Detected** — is displayed and saved
6. Users can view their full analysis history
7. Admin users can manage all registered users (roles, blocking, deletion) and view any user's history

---

## Features

- User registration with validation (age 18+, email format, password confirmation)
- Login with JWT authentication
- Video upload with drag & drop support and optional custom name
- AI-powered violence detection per uploaded video
- Personal history page showing all uploads and their results
- Admin panel: manage users, change roles, block/unblock, delete
- Sticky navigation bar with active page indicator

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| File Upload | Multer |
| Auth | JWT (custom implementation) |
| AI Service | Python, FastAPI, PyTorch (MViT model) |

---

## Database Structure

**users**
| Field | Type | Description |
|-------|------|-------------|
| firstName | String | |
| lastName | String | |
| age | Number | Must be 18 or older |
| email | String | Unique, validated format |
| username | String | Unique |
| passwordHash | String | Hashed with scrypt |
| role | String | `user` or `admin` |
| status | String | `active` or `blocked` |

**videos**
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to the user who uploaded |
| displayName | String | Custom name or original filename |
| originalName | String | Original filename from the user's computer |
| fileName | String | Saved filename on the server |
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

## Setup and Running

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)
- The AI model release folder: `SmartSecurity_API_Release`

### Step 1 — Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### Step 2 — Create environment file

Copy the example file:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ai-smart-security-system
JWT_SECRET=your-secret-key-here
AI_API_URL=http://localhost:8000/analyze
```

### Step 3 — Install Python dependencies (AI model)

```bash
cd SmartSecurity_API_Release
pip3 install -r requirements.txt
```

---

## Running the Project

Open **3 terminal windows**:

**Terminal 1 — MongoDB** (if running locally):
```bash
mongod --dbpath /path/to/data
```

**Terminal 2 — Node.js server:**
```bash
cd server && npm run dev
```

**Terminal 3 — React frontend:**
```bash
cd client && npm run dev
```

**Terminal 4 — Python AI API** (needed for video analysis):
```bash
cd SmartSecurity_API_Release && python3 api.py
```

Open the app at: **http://localhost:5173**

---

## AI Model Integration

The AI model runs as a separate Python FastAPI service on port 8000.

The Node.js backend sends the uploaded video file path to the AI API:

**Request:**
```json
POST http://localhost:8000/analyze
{ "source": "/path/to/uploads/video.mp4" }
```

**Response:**
```json
{ "is_violent": false, "total_clips": 4, "status": "success" }
```

After analysis, the video file is deleted from disk and only the result is saved in MongoDB.

---

## Notes

- The first registered user automatically becomes **admin**
- Blocked users cannot log in
- Videos are deleted from disk after analysis — only the name and result are kept in the database
- The admin can view the history of any user through the Admin panel

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection refused | Make sure MongoDB is running |
| AI analysis failed | Make sure `python3 api.py` is running on port 8000 |
| Port 5001 in use | Kill the process using that port and restart the server |
| Video not showing in upload | Make sure the file has a video extension (.mp4, .avi, etc.) |

---

## Team

**Full-Stack Team**
- Yuval Sucar
- Yair Bar
- Shoham
- Gilad

**AI Model Team**
- Violence detection model using MViT (Multiscale Vision Transformers)
- Provided as FastAPI service
