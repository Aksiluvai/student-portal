import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/students" element={<Protected><Students /></Protected>} />
          <Route path="/courses" element={<Protected><Courses /></Protected>} />
          <Route path="/marks" element={<Protected><Marks /></Protected>} />
          <Route path="/attendance" element={<Protected><Attendance /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}