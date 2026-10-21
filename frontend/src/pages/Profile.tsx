import { useEffect, useState } from "react";
import { getProfile, changePassword } from "../api/profileApi";
import type { ProfileInfo } from "../types/profile";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPw !== confirm) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      await changePassword(current, newPw);
      setSuccess("Password changed successfully.");
      setCurrent("");
      setNewPw("");
      setConfirm("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="section-title">👤 My Profile</h2>

        <div className="profile-grid">
          <div className="card">
            {profile ? (
              <>
                <div className="profile-head">
                  <div className="avatar">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{profile.name}</h2>
                    <span className="tag">{profile.role}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className="info-value">{profile.role}</span>
                </div>
                {profile.role === "Student" && (
                  <>
                    <div className="info-row">
                      <span className="info-label">Department</span>
                      <span className="info-value">{profile.department ?? "-"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Year</span>
                      <span className="info-value">{profile.year ?? "-"}</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="muted-text">Loading...</p>
            )}
          </div>

          <div className="card">
            <h3 className="chart-title">🔒 Change Password</h3>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form className="pw-form" onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Current password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button className="btn" type="submit">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}