import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

const formatSeconds = (seconds = 0) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
};

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.detail ? `${body.message}: ${body.detail}` : body.message || "Request failed");
  }

  return body;
}

function AuthField({ id, label, type = "text", value, onChange }) {
  return (
    <label className="field-row" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type={type} name={id} value={value} onChange={onChange} />
    </label>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignup && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = isSignup
        ? {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            username: form.username,
            password: form.password
          }
        : { username: form.username, password: form.password };

      const data = await apiRequest(isSignup ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`auth-card ${isSignup ? "auth-card--signup" : ""}`} aria-labelledby="auth-title">
      <p className="auth-brand">AI Smart Security System</p>
      <h1 id="auth-title">{isSignup ? "Sign up" : "Login"}</h1>
      <form className="auth-form" onSubmit={submit}>
        {isSignup && (
          <>
            <AuthField id="firstName" label="First Name" value={form.firstName} onChange={updateForm} />
            <AuthField id="lastName" label="Last Name" value={form.lastName} onChange={updateForm} />
            <AuthField id="email" label="Email" type="email" value={form.email} onChange={updateForm} />
          </>
        )}
        <AuthField id="username" label="Username" value={form.username} onChange={updateForm} />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={updateForm}
        />
        {isSignup && (
          <AuthField
            id="confirmPassword"
            label="Confirm"
            type="password"
            value={form.confirmPassword}
            onChange={updateForm}
          />
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <button className="auth-switch-button" type="button" onClick={() => setMode(isSignup ? "login" : "signup")}>
        {isSignup ? "Already have an account? Click to login" : "Don't have an account? Click to sign up"}
      </button>
    </section>
  );
}

function ResultSummary({ result }) {
  if (!result) {
    return <p className="empty-state">Upload and analyze a video to see the violence detection result.</p>;
  }

  return (
    <div className={`result-box ${result.isViolent ? "result-box--danger" : "result-box--safe"}`}>
      <span>{result.isViolent ? "Violence detected" : "No violence detected"}</span>
      <strong>{result.isViolent ? "Yes" : "No"}</strong>

      {result.violentSegments?.length > 0 && (
        <div className="segments">
          {result.violentSegments.map((segment) => (
            <span key={`${segment.startSecond}-${segment.endSecond}`}>
              {formatSeconds(segment.startSecond)} - {formatSeconds(segment.endSecond)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getHistoryResult(video) {
  if (video.analysisResult) {
    return {
      label: video.analysisResult.isViolent ? "YES" : "NO",
      tone: video.analysisResult.isViolent ? "yes" : "no"
    };
  }

  if (video.status === "failed") {
    return { label: "Failed", tone: "muted" };
  }

  if (video.status === "analyzing") {
    return { label: "Analyzing", tone: "muted" };
  }

  return { label: "Pending", tone: "muted" };
}

function AdminConsole({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const data = await apiRequest("/users");
    setUsers(data.users);
  };

  useEffect(() => {
    loadUsers().catch((err) => setMessage(err.message));
  }, []);

  const updateUser = async (userId, path, payload, successMessage) => {
    setLoading(true);
    setMessage("");

    try {
      await apiRequest(`/users/${userId}/${path}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setMessage(successMessage);
      await loadUsers();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (managedUser) => {
    const approved = window.confirm(`Delete ${managedUser.username} and all related video data?`);

    if (!approved) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await apiRequest(`/users/${managedUser.id}`, { method: "DELETE" });
      setMessage("User deleted successfully");
      await loadUsers();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-console">
      <div className="section-heading">
        <div>
          <h2>User Details</h2>
        </div>
        <button className="secondary-button" type="button" onClick={loadUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {message && <p className="status-message">{message}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((managedUser) => {
              const isSelf = managedUser.id === currentUser.id;

              return (
                <tr key={managedUser.id}>
                  <td>
                    <strong>{managedUser.firstName} {managedUser.lastName}</strong>
                    <span className="muted-cell">@{managedUser.username}</span>
                  </td>
                  <td>{managedUser.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={managedUser.role}
                      disabled={loading || isSelf}
                      onChange={(event) =>
                        updateUser(managedUser.id, "role", { role: event.target.value }, "Role updated successfully")
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${managedUser.status}`}>
                      {managedUser.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="secondary-button action-button"
                        type="button"
                        disabled={loading || isSelf}
                        onClick={() =>
                          updateUser(
                            managedUser.id,
                            "status",
                            { status: managedUser.status === "active" ? "disabled" : "active" },
                            managedUser.status === "active" ? "User blocked successfully" : "User unblocked successfully"
                          )
                        }
                      >
                        {managedUser.status === "active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        className="danger-button action-button"
                        type="button"
                        disabled={loading || isSelf}
                        onClick={() => deleteUser(managedUser)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Dashboard({ user, onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const isAdmin = user.role === "admin";
  const canViewAll = isAdmin;
  const stats = useMemo(() => {
    const completed = videos.filter((video) => video.status === "completed").length;

    return {
      total: videos.length,
      completed
    };
  }, [videos]);

  const loadVideos = async () => {
    const data = await apiRequest("/videos");
    setVideos(data.videos);
  };

  useEffect(() => {
    loadVideos().catch((err) => setMessage(err.message));
  }, []);

  const uploadAndAnalyze = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage("Please select a video before starting analysis.");
      return;
    }

    setLoading(true);
    setMessage("Uploading video...");
    setActiveResult(null);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      const upload = await apiRequest("/videos/upload", {
        method: "POST",
        body: formData
      });

      setMessage("Analyzing video. This may take a few minutes...");
      const analysis = await apiRequest(`/videos/${upload.video._id}/analyze`, {
        method: "POST"
      });

      setActiveResult(analysis.result);
      setMessage("Analysis completed");
      setSelectedFile(null);
      await loadVideos();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <span>AI Smart Security System</span>
          <strong>Video Violence Detection</strong>
        </div>
        <div className="topbar__actions">
          {isAdmin && (
            <button
              className="secondary-button"
              type="button"
              onClick={() => setActivePage(activePage === "dashboard" ? "admin" : "dashboard")}
            >
              {activePage === "dashboard" ? "Management" : "Home"}
            </button>
          )}
          <span className="user-name">{user.firstName} {user.lastName}</span>
          <span className="role-pill">{user.role}</span>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {activePage === "admin" && isAdmin ? (
        <AdminConsole currentUser={user} />
      ) : (
        <>
          <section className="stats-grid" aria-label="Video analysis overview">
            <div className="stat-card">
              <span>Total Videos</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-card">
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </section>

          <section className="dashboard-grid">
            <form className="tool-panel upload-panel" onSubmit={uploadAndAnalyze}>
              <h2>Upload Video</h2>
              <label className="upload-dropzone">
                <input
                  className="file-input"
                  type="file"
                  accept="video/*"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
                <span>{selectedFile ? selectedFile.name : "Select video file"}</span>
                <small>MP4 or any supported video format</small>
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Working..." : "Upload & Analyze"}
              </button>
              {message && <p className="status-message">{message}</p>}

              {activeResult && (
                <div className="inline-result">
                  <h3>Analysis Result</h3>
                  <ResultSummary result={activeResult} />
                </div>
              )}
            </form>
          </section>

          <section className="history-panel">
            <div className="section-heading">
              <div>
                <h2>{canViewAll ? "All Video History" : "My Video History"}</h2>
              </div>
              <button className="secondary-button" type="button" onClick={() => loadVideos()}>
                Refresh
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => {
                    const result = getHistoryResult(video);

                    return (
                      <tr key={video._id}>
                        <td>{video.originalName}</td>
                        <td><span className={`status-badge status-badge--${video.status}`}>{video.status}</span></td>
                        <td>{new Date(video.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`result-label result-label--${result.tone}`}>{result.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {videos.length === 0 && (
                    <tr>
                      <td colSpan="4">No videos uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setBooting(false);
      return;
    }

    apiRequest("/auth/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setBooting(false));
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  if (booting) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <div className={`page-shell ${user ? "page-shell--dashboard" : "page-shell--auth"}`}>
      {user ? (
        <Dashboard user={user} onLogout={logout} />
      ) : (
        <AuthScreen onAuthenticated={(nextUser) => setUser(nextUser)} />
      )}
    </div>
  );
}

export default App;
