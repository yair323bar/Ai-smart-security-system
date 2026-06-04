import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5001/api";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          age: form.age,
          email: form.email,
          username: form.username,
          password: form.password
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell page-shell--auth">
      <div className="auth-card auth-card--signup">
        <p className="auth-brand">AI Smart Security System</p>
        <h1>Sign Up</h1>
        <form className="auth-form" onSubmit={submit}>
          <label className="field-row">
            <span>First Name</span>
            <input name="firstName" value={form.firstName} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Last Name</span>
            <input name="lastName" value={form.lastName} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Age</span>
            <input name="age" type="number" min="18" value={form.age} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Username</span>
            <input name="username" value={form.username} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={update} required />
          </label>
          <label className="field-row">
            <span>Confirm</span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Sign Up"}
          </button>
        </form>

        <Link to="/" className="auth-switch-button">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
