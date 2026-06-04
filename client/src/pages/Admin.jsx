import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:5001/api";
const TOKEN_KEY = "smart_security_token";

function Admin() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem("user")); } catch {}

  const token = localStorage.getItem(TOKEN_KEY);

  const loadUsers = () => {
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []));
  };

  useEffect(() => { loadUsers(); }, []);

  const flash = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000); };

  const updateRole = async (userId, role) => {
    await fetch(`${API}/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role })
    });
    flash("Role updated");
    loadUsers();
  };

  const toggleStatus = async (userId, currentStatus) => {
    const status = currentStatus === "active" ? "blocked" : "active";
    await fetch(`${API}/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    flash(status === "blocked" ? "User blocked" : "User unblocked");
    loadUsers();
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user @${username} and all their data?`)) return;
    await fetch(`${API}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    flash("User deleted");
    loadUsers();
  };

  return (
    <div className="page-shell page-shell--dashboard">
      <Navbar />
      <main className="main-content">
        <div className="page-card">
          <h2>User Management</h2>
          {message && <p className="flash-message">{message}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id?.toString() === currentUser?.id?.toString();
                  return (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.firstName} {u.lastName}</strong>
                        <span className="cell-muted">@{u.username}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.age}</td>
                      <td>
                        <select
                          className="role-select"
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.status === "active" ? "badge--safe" : "badge--danger"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => navigate(`/history?userId=${u._id}&name=${u.firstName} ${u.lastName}`)}
                          >
                            History
                          </button>
                          <button
                            className={`btn-sm ${u.status === "active" ? "btn-warning" : "btn-secondary"}`}
                            disabled={isSelf}
                            onClick={() => toggleStatus(u._id, u.status)}
                          >
                            {u.status === "active" ? "Block" : "Unblock"}
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            disabled={isSelf}
                            onClick={() => deleteUser(u._id, u.username)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;
