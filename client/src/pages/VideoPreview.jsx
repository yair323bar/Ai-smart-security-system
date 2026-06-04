import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function VideoPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { videoId, videoUrl, videoName } = location.state || {};

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!videoId) {
    navigate("/upload");
    return null;
  }

  const analyze = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/videos/${videoId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.detail);

      setResult(data.result);
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
          <h2>{videoName}</h2>

          <video className="video-player" src={videoUrl} controls />

          {!result && (
            <div className="preview-actions">
              <button className="btn-primary" onClick={analyze} disabled={loading}>
                {loading ? "Analyzing... This may take a few minutes" : "Analyze Video"}
              </button>
              <button className="btn-secondary" onClick={() => navigate("/upload")}>
                Replace Video
              </button>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          {result && (
            <div className={`result-banner ${result.isViolent ? "result-banner--danger" : "result-banner--safe"}`}>
              <div className="result-banner-label">
                {result.isViolent ? "Violence Detected" : "No Violence Detected"}
              </div>
              <div className="result-banner-verdict">{result.isViolent ? "YES" : "NO"}</div>
              <div className="preview-actions" style={{ marginTop: "16px" }}>
                <button className="btn-secondary" onClick={() => navigate("/history")}>View History</button>
                <button className="btn-secondary" onClick={() => navigate("/upload")}>Analyze Another Video</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default VideoPreview;
