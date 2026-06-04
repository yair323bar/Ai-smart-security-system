import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  const logout = () => {
    localStorage.removeItem("smart_security_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">AI Smart Security</span>
      <div className="navbar-links">
        <Link to="/upload" className="nav-link">Home</Link>
        <Link to="/history" className="nav-link">History</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="nav-link nav-link--admin">Admin</Link>
        )}
      </div>
      <div className="navbar-right">
        <span className="navbar-greeting">Hello, {user?.firstName}</span>
        <button className="navbar-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
