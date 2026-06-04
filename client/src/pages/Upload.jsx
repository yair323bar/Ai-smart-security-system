import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function Upload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/");
  };

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
          videoName: data.video.originalName
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
      <main className="dashboard">
        <header className="topbar">
          <div>
            <span>AI Smart Security System</span>
            <strong>Video Violence Detection</strong>
          </div>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </header>

        <section className="tool-panel upload-panel">
          <h2>Upload Video</h2>
          <p className="status-message">Select a video file from your computer to analyze for violent content.</p>

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
            <span>{file ? `Selected: ${file.name}` : "Click to browse or drag & drop a video here"}</span>
            <small>Supported formats: MP4, AVI, MOV and other video formats</small>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="primary-button"
            onClick={handleContinue}
            disabled={!file || loading}
          >
            {loading ? "Uploading..." : "Continue →"}
          </button>
        </section>
      </main>
    </div>
  );
}

export default Upload;
