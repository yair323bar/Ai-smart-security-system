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
```

## Repository

[Ai-smart-security-system](https://github.com/yair323bar/Ai-smart-security-system)
