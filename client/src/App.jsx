import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import VideoPreview from "./pages/VideoPreview";
import History from "./pages/History";
import Admin from "./pages/Admin";

const TOKEN_KEY = "smart_security_token";

function PrivateRoute({ children }) {
  return localStorage.getItem(TOKEN_KEY) ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  if (!localStorage.getItem(TOKEN_KEY)) return <Navigate to="/" replace />;
  if (user?.role !== "admin") return <Navigate to="/upload" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/preview" element={<PrivateRoute><VideoPreview /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
