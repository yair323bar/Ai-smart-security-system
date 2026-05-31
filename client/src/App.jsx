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
    throw new Error(body.message || body.detail || "Request failed");
  }

  return body;
}

function Landing({ onStart }) {
  return (
    <section className="landing">
      <div className="landing__content">
        <p className="eyebrow">AI Smart Security System</p>
        <h1>Detect violence in uploaded videos and show the exact time ranges.</h1>
        <p className="landing__text">
          A full-stack security dashboard for uploading videos, analyzing them through an AI
          service, storing results in MongoDB, and reviewing detection history by user role.
        </p>
        <button className="primary-button" type="button" onClick={onStart}>
          Start
        </button>
      </div>

      <div className="landing__panel" aria-label="System summary">
        <div>
          <span>Pipeline</span>
          <strong>Upload to AI to MongoDB to Results</strong>
        </div>
        <div>
          <span>Output</span>
          <strong>Violence: Yes/No + timestamps</strong>
        </div>
        <div>
          <span>Roles</span>
          <strong>Admin, Operator, User</strong>
        </div>
      </div>
    </section>
  );
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
    <section className="auth-card" aria-labelledby="auth-title">
      <h1 id="auth-title">{isSignup ? "Create Account" : "Login"}</h1>
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

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <button className="text-button" type="button" onClick={() => setMode(isSignup ? "login" : "signup")}>
        {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
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
      <p>Total clips analyzed: {result.totalClips}</p>

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

function Dashboard({ user, onLogout }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canViewAll = useMemo(() => ["admin", "operator"].includes(user.role), [user.role]);

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
      setMessage("Choose a video first");
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

      setMessage("Analyzing video with the AI model...");
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

  const viewResult = async (videoId) => {
    setMessage("");
    const data = await apiRequest(`/videos/${videoId}/result`);
    setActiveResult(data.result);
  };

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <span>AI Smart Security</span>
          <strong>{user.firstName} {user.lastName}</strong>
        </div>
        <div className="topbar__actions">
          <span className="role-pill">{user.role}</span>
          <button className="secondary-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-grid">
        <form className="tool-panel" onSubmit={uploadAndAnalyze}>
          <h2>Upload Video</h2>
          <p>Choose an MP4 video. The backend will send it to the Python AI API.</p>
          <input
            className="file-input"
            type="file"
            accept="video/*"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Working..." : "Upload & Analyze"}
          </button>
          {message && <p className="status-message">{message}</p>}
        </form>

        <section className="tool-panel">
          <h2>Analysis Result</h2>
          <ResultSummary result={activeResult} />
        </section>
      </section>

      <section className="history-panel">
        <div className="section-heading">
          <div>
            <h2>{canViewAll ? "All Video History" : "My Video History"}</h2>
            <p>Results are stored in MongoDB and can be reviewed after analysis.</p>
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
              {videos.map((video) => (
                <tr key={video._id}>
                  <td>{video.originalName}</td>
                  <td>{video.status}</td>
                  <td>{new Date(video.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="text-button" type="button" onClick={() => viewResult(video._id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan="4">No videos uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState("landing");
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
        setScreen("dashboard");
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setBooting(false));
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setScreen("landing");
  };

  if (booting) {
    return <div className="page-shell">Loading...</div>;
  }

  return (
    <div className="page-shell">
      {screen === "landing" && <Landing onStart={() => setScreen("auth")} />}
      {screen === "auth" && <AuthScreen onAuthenticated={(nextUser) => {
        setUser(nextUser);
        setScreen("dashboard");
      }} />}
      {screen === "dashboard" && user && <Dashboard user={user} onLogout={logout} />}
    </div>
  );
}

export default App;
