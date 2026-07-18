import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import * as quizService from "../../services/quizService";
import * as userService from "../../services/userService";

import "./Profile.css";


const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    username: "",
    bio: "",
    twitter: "",
    github: "",
    linkedin: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete account confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError(null);
      const result = await quizService.getMyResults();
      if (result.success) {
        setMyAttempts(result.data || []);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    fetchAttempts();

    // Populate edit data
    if (user) {
      setEditData({
        fullName: user.fullName || "",
        username: user.username || "",
        bio: user.bio || "",
        twitter: user.socialLinks?.twitter || "",
        github: user.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
        website: user.socialLinks?.website || "",
      });
      setAvatarPreview(user.profileImage || "");
    }
  }, [user]);

  // Calculate user profile stats dynamically
  const profileStats = useMemo(() => {
    const totalAttempted = myAttempts.length;
    const average = totalAttempted
      ? Math.round(
          myAttempts.reduce((sum, item) => sum + (item.percentage || 0), 0) / totalAttempted
        )
      : 0;
    const highest = totalAttempted
      ? Math.max(...myAttempts.map((item) => item.percentage || 0))
      : 0;

    return [
      { label: "Total Quizzes Attempted", value: String(totalAttempted) },
      { label: "Average Score", value: `${average}%` },
      { label: "Highest Score", value: `${highest}%` },
    ];
  }, [myAttempts]);

  const recentAttempts = myAttempts.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("fullName", editData.fullName.trim());
      formData.append("username", editData.username.trim().toLowerCase());
      formData.append("bio", editData.bio.trim());
      
      const socialLinks = {
        twitter: editData.twitter.trim(),
        github: editData.github.trim(),
        linkedin: editData.linkedin.trim(),
        website: editData.website.trim(),
      };
      formData.append("socialLinks", JSON.stringify(socialLinks));

      if (avatarFile) {
        formData.append("profileImage", avatarFile);
      }

      const response = await userService.updateUserProfile(formData);
      if (response.success && response.data) {
        updateUser(response.data);
        setEditSuccess("Profile updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccess("");
        }, 1500);
      } else {
        setEditError(response.message || "Failed to update profile.");
      }
    } catch (err) {
      setEditError(err.message || "An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      return;
    }
    setEditError("");
    setIsDeleting(true);

    try {
      const response = await userService.deleteAccount();
      if (response.success) {
        setIsDeleting(false);
        setShowDeleteModal(false);
        logout();
        navigate("/login", { replace: true });
      } else {
        setEditError(response.message || "Failed to delete account.");
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (err) {
      setEditError(err.message || "An error occurred.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <section className="profile-hero" aria-labelledby="profile-title">
          <div className="container">
            {isEditing ? (
              <div className="profile-hero__card" style={{ display: "block", width: "100%" }}>
                <h2 style={{ marginBottom: "1.5rem", color: "var(--color-primary)" }}>Edit Profile Details</h2>
                <form onSubmit={handleSaveProfile} className="register-form" style={{ maxWidth: "100%", padding: 0, background: "transparent", border: "none" }}>
                  {editError && <p className="register-form__error" role="alert">{editError}</p>}
                  {editSuccess && <p className="register-form__success" role="status">{editSuccess}</p>}

                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", background: "#f0f0f0" }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", color: "#999", fontWeight: "bold" }}>
                          U
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="avatar-upload" className="button button--secondary" style={{ padding: "0.5rem 1rem", cursor: "pointer", display: "inline-block" }}>
                        Upload Profile Photo
                      </label>
                      <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </div>
                  </div>

                  <div className="register-form__row">
                    <div className="register-form__group">
                      <label htmlFor="fullName">Full Name</label>
                      <input id="fullName" name="fullName" type="text" value={editData.fullName} onChange={handleEditChange} required />
                    </div>
                    <div className="register-form__group">
                      <label htmlFor="username">Username</label>
                      <input id="username" name="username" type="text" value={editData.username} onChange={handleEditChange} required />
                    </div>
                  </div>

                  <div className="register-form__group">
                    <label htmlFor="bio">Bio</label>
                    <textarea id="bio" name="bio" rows="3" value={editData.bio} onChange={handleEditChange} placeholder="Write a short bio..." style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-main)" }} />
                  </div>

                  <h3 style={{ margin: "1.5rem 0 1rem", fontSize: "1.1rem" }}>Social Profile Links</h3>
                  <div className="register-form__row">
                    <div className="register-form__group">
                      <label htmlFor="twitter">Twitter Link</label>
                      <input id="twitter" name="twitter" type="url" value={editData.twitter} onChange={handleEditChange} placeholder="https://twitter.com/username" />
                    </div>
                    <div className="register-form__group">
                      <label htmlFor="github">GitHub Link</label>
                      <input id="github" name="github" type="url" value={editData.github} onChange={handleEditChange} placeholder="https://github.com/username" />
                    </div>
                  </div>
                  <div className="register-form__row">
                    <div className="register-form__group">
                      <label htmlFor="linkedin">LinkedIn Link</label>
                      <input id="linkedin" name="linkedin" type="url" value={editData.linkedin} onChange={handleEditChange} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="register-form__group">
                      <label htmlFor="website">Personal Website</label>
                      <input id="website" name="website" type="url" value={editData.website} onChange={handleEditChange} placeholder="https://example.com" />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                    <Button type="submit" variant="primary" loading={isSaving} disabled={isSaving}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="profile-hero__card">
                <div className="profile-avatar" aria-hidden="true" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                  )}
                </div>

                <div className="profile-hero__content">
                  <p className="profile-hero__eyebrow">My Profile</p>
                  <h1 id="profile-title">{user?.fullName || "User Profile"}</h1>
                  <p style={{ fontStyle: "italic", margin: "0.5rem 0 1.5rem 0", color: "var(--color-text-muted)" }}>
                    {user?.bio || "No bio added yet."}
                  </p>

                  <dl className="profile-details">
                    <div>
                      <dt>Email</dt>
                      <dd>{user?.email || "-"}</dd>
                    </div>
                    <div>
                      <dt>Username</dt>
                      <dd>@{user?.username || "-"}</dd>
                    </div>
                    <div>
                      <dt>Account Status</dt>
                      <dd>{user?.isActive ? "Active" : "Inactive"}</dd>
                    </div>
                    <div>
                      <dt>Member Since</dt>
                      <dd>{formatDate(user?.createdAt)}</dd>
                    </div>
                  </dl>

                  {user?.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
                    <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {user.socialLinks.twitter && (
                        <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "bold" }}>
                          Twitter
                        </a>
                      )}
                      {user.socialLinks.github && (
                        <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "bold" }}>
                          GitHub
                        </a>
                      )}
                      {user.socialLinks.linkedin && (
                        <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "bold" }}>
                          LinkedIn
                        </a>
                      )}
                      {user.socialLinks.website && (
                        <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "bold" }}>
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="profile-stats-title">
          <div className="container">
            <div className="profile-section-heading">
              <h2 id="profile-stats-title">Profile Stats</h2>
              <p>Your quiz activity and performance summary.</p>
            </div>

            <div className="profile-stats-grid">
              {profileStats.map((stat) => (
                <article className="profile-stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-section profile-section--surface" aria-labelledby="account-actions-title">
          <div className="container">
            <div className="profile-section-heading">
              <h2 id="account-actions-title">Account Actions</h2>
              <p>Manage your profile, password and account access.</p>
            </div>

            <div className="profile-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Button type="button" variant="primary" size="large" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Link to="/forgot-password" style={{ flex: 1, minWidth: "150px" }}>
                <Button variant="outline" size="large" fullWidth>
                  Change Password
                </Button>
              </Link>
              <Button type="button" variant="outline" size="large" onClick={handleLogout}>
                Logout
              </Button>
              <Button type="button" variant="secondary" size="large" onClick={() => setShowDeleteModal(true)} style={{ background: "#f44336", border: "1px solid #f44336", color: "white" }}>
                Delete Account
              </Button>
            </div>
          </div>
        </section>

        <section className="profile-section" aria-labelledby="activity-title">
          <div className="container">
            <div className="profile-section-heading">
              <h2 id="activity-title">Activity Summary</h2>
              <p>Recent quiz attempts and latest account activity.</p>
            </div>

            <div className="profile-activity-layout">
              <article className="profile-activity-card" style={{ flex: 2 }}>
                <h3>Recent Quiz Attempts</h3>

                {loading ? (
                  <p>Loading recent attempts...</p>
                ) : error ? (
                  <p role="alert" className="error-message">{error}</p>
                ) : recentAttempts.length === 0 ? (
                  <p style={{ padding: "1rem 0" }}>No quiz attempts yet.</p>
                ) : (
                  <div className="profile-attempt-list">
                    {recentAttempts.map((attempt) => {
                      const isPass = (attempt.percentage || 0) >= 60;
                      return (
                        <div className="profile-attempt-item" key={attempt._id} style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid var(--color-border)" }}>
                          <div>
                            <Link to={`/result/${attempt._id}`} style={{ textDecoration: "none", color: "var(--color-primary)" }}>
                              <h4 style={{ margin: 0 }}>{attempt.quiz?.title || "Untitled Quiz"}</h4>
                            </Link>
                            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                              {attempt.quiz?.category || "-"} • {formatDate(attempt.submittedAt)}
                            </p>
                          </div>

                          <div className="profile-attempt-item__result" style={{ textAlign: "right" }}>
                            <strong style={{ display: "block" }}>{Math.round(attempt.percentage || 0)}%</strong>
                            <span className={`profile-result-badge profile-result-badge--${isPass ? "pass" : "fail"}`} style={{ display: "inline-block", fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: isPass ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)", color: isPass ? "#4CAF50" : "#f44336" }}>
                              {isPass ? "Pass" : "Fail"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              <aside className="profile-summary-card" aria-labelledby="summary-title" style={{ flex: 1 }}>
                <h3 id="summary-title">Account Summary</h3>

                <dl>
                  <div style={{ marginBottom: "1rem" }}>
                    <dt style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Last Login</dt>
                    <dd>{formatDate(user?.lastLogin) || "-"}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: "bold", fontSize: "0.9rem" }}>User ID</dt>
                    <dd style={{ fontSize: "0.8em", wordBreak: "break-all", color: "var(--color-text-muted)" }}>{user?._id}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>
      </main>

      {showDeleteModal && (
        <Modal 
          title="Delete Account Permanent Action" 
          onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
        >
          <div style={{ padding: "1rem" }}>
            <p style={{ color: "#f44336", fontWeight: "bold", marginBottom: "1rem" }}>
              WARNING: This is permanent. Deleting your account will delete all quizzes you created, your bookmarks, activity logs, attempt histories, comments, and results.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Type <strong style={{ color: "var(--color-primary)" }}>delete my account</strong> to confirm:
            </p>
            <input 
              type="text" 
              value={deleteConfirmText} 
              onChange={(e) => setDeleteConfirmText(e.target.value)} 
              placeholder="delete my account" 
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", marginBottom: "1.5rem" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button 
                type="button" 
                variant="primary" 
                loading={isDeleting} 
                disabled={deleteConfirmText.toLowerCase() !== "delete my account" || isDeleting}
                onClick={handleDeleteAccount}
                style={{ background: "#f44336", border: "1px solid #f44336" }}
              >
                Delete Account Forever
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </>
  );
}

export default Profile;