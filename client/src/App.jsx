import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import VideoPreview from "./pages/VideoPreview";

const TOKEN_KEY = "smart_security_token";

function PrivateRoute({ children }) {
  return localStorage.getItem(TOKEN_KEY) ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/preview" element={<PrivateRoute><VideoPreview /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
