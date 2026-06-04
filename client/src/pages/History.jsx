import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const userName = searchParams.get("name");

  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem("user")); } catch {}

  useEffect(() => {
    const url =
      userId && currentUser?.role === "admin"
        ? `${API}/admin/users/${userId}/videos`
        : `${API}/videos`;

    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` } })
      .then((r) => r.json())
      .then((data) => { setVideos(data.videos || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

  return (
    <div className="page-shell page-shell--dashboard">
      <Navbar />
      <main className="main-content">
        <div className="page-card">
          <h2>{userId && userName ? `${userName}'s History` : "My Video History"}</h2>

          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : videos.length === 0 ? (
            <p className="empty-state">No videos uploaded yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Video Name</th>
                    <th>Upload Date</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id}>
                      <td>{video.displayName || video.originalName}</td>
                      <td>{formatDate(video.createdAt)}</td>
                      <td>
                        {video.result ? (
                          <span className={`badge ${video.result.isViolent ? "badge--danger" : "badge--safe"}`}>
                            {video.result.isViolent ? "Violence" : "Safe"}
                          </span>
                        ) : (
                          <span className="badge badge--pending">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default History;
