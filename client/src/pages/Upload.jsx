import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function Upload() {
  const [file, setFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
      setError("");
    } else {
      setError("Please drop a valid video file");
    }
  };

  const handleContinue = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video", file);
      if (videoName.trim()) formData.append("displayName", videoName.trim());

      const res = await fetch(`${API}/videos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
        body: formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      navigate("/preview", {
        state: {
          videoId: data.video._id,
          videoUrl: `http://localhost:5001/uploads/${data.video.fileName}`,
          videoName: data.video.displayName
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--dashboard">
      <Navbar />
      <main className="main-content">
        <div className="page-card">
          <h2>Upload Video</h2>
          <p className="page-subtitle">Upload a video to detect violent content using AI</p>

          <div
            className={`upload-dropzone${dragging ? " upload-dropzone--active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              className="file-input"
              type="file"
              accept="video/*"
              onChange={(e) => { setFile(e.target.files[0]); setError(""); }}
            />
            <div className="dropzone-icon">▶</div>
            <span>{file ? `${file.name}  (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "Click to browse or drag & drop"}</span>
            <small>MP4, AVI, MOV and other formats — up to 300MB</small>
          </div>

          <div className="field-group">
            <label htmlFor="videoName">Video name (optional)</label>
            <input
              id="videoName"
              type="text"
              placeholder={file ? file.name : "Give this video a name..."}
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn-primary" onClick={handleContinue} disabled={!file || loading}>
            {loading ? "Uploading..." : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Upload;
