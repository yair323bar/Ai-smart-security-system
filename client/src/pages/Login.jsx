import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem(TOKEN_KEY, data.token);
      navigate("/upload");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--auth">
      <div className="auth-card">
        <p className="auth-brand">AI Smart Security System</p>
        <h1>Login</h1>
        <form className="auth-form" onSubmit={submit}>
          <label className="field-row">
            <span>Username</span>
            <input name="username" value={form.username} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        <Link to="/register" className="auth-switch-button">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  );
}

export default Login;
