import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/");
  };

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
      <main className="dashboard">
        <header className="topbar">
          <div>
            <span>AI Smart Security System</span>
            <strong>Video Violence Detection</strong>
          </div>
          <button className="secondary-button" onClick={logout}>Logout</button>
        </header>

        <section className="tool-panel">
          <h2>{videoName}</h2>

          <video className="video-player" src={videoUrl} controls />

          {!result && (
            <div className="preview-actions">
              <button className="primary-button" onClick={analyze} disabled={loading}>
                {loading ? "Analyzing... This may take a few minutes" : "Analyze Video"}
              </button>
              <button className="secondary-button" onClick={() => navigate("/upload")}>
                Replace Video
              </button>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          {result && (
            <div className={`result-box ${result.isViolent ? "result-box--danger" : "result-box--safe"}`}>
              <span>{result.isViolent ? "Violence Detected" : "No Violence Detected"}</span>
              <strong>{result.isViolent ? "Yes" : "No"}</strong>
              <button
                className="secondary-button"
                onClick={() => navigate("/upload")}
                style={{ marginTop: "16px", width: "fit-content" }}
              >
                Analyze Another Video
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default VideoPreview;
