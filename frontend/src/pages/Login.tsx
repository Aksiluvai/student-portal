import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = isRegister
        ? await registerApi(name, email, password)
        : await loginApi(email, password);
      login(res);
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please check that the backend is running."
      );
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={handleSubmit}>
        <h1>🎓 Student Portal</h1>
        <p className="sub">
          {isRegister ? "Create a new account" : "Login to your account"}
        </p>

        {error && <div className="error">{error}</div>}

        {isRegister && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-wrap">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button className="btn" type="submit">
          {isRegister ? "Register" : "Login"}
        </button>

        <p className="switch">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </form>
    </div>
  );
}