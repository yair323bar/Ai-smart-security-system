import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
        <Link to="/upload" className={`nav-link${pathname === "/upload" ? " nav-link--active" : ""}`}>Home</Link>
        <Link to="/history" className={`nav-link${pathname === "/history" ? " nav-link--active" : ""}`}>History</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className={`nav-link nav-link--admin${pathname === "/admin" ? " nav-link--active" : ""}`}>Admin</Link>
        )}
      </div>
      <div className="navbar-right">
        <span className="navbar-greeting">Hello, {user?.firstName}</span>
        <button className="navbar-logout" onClick={logout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
