import { useEffect, useState, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000";
const MENU_API = `${API_BASE}/menuItems`;
const AUTH_API = `${API_BASE}/auth`;

const CATEGORIES = ["All", "Starter", "Main Course", "Dessert", "Beverage"];

// =========================================================================
// 1. USER MENU COMPONENT (PUBLIC ROUTE: /)
// =========================================================================
function UserMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState("none"); // 'none' | 'lowToHigh' | 'highToLow'

  // Fetch all menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(MENU_API);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Filter ONLY available items, apply category, search, and price sorting
  const availableDishes = useMemo(() => {
    // Only available items for public users
    let list = menuItems.filter((item) => item.available);

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Price sorting
    if (priceSort === "lowToHigh") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (priceSort === "highToLow") {
      return [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [menuItems, selectedCategory, searchQuery, priceSort]);

  return (
    <div className="app-layout">
      {/* PUBLIC NAVBAR (NO TOGGLE) */}
      <header className="navbar">
        <div className="nav-brand">
          <span className="brand-logo">✨</span>
          <div>
            <h1 className="brand-title">The Grand Bistro</h1>
            <span className="brand-subtitle">Fresh Daily Menu</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className="customer-status-badge">
            <span className="status-dot"></span>
            <span>Kitchen Open</span>
          </div>
        </div>
      </header>

      <main className="content-container">
        {/* HERO SECTION */}
        <section className="customer-hero">
          <div className="hero-content">
            <span className="hero-tag">Welcome to The Grand Bistro</span>
            <h2>Handcrafted Cuisine, Served Daily</h2>
            <p>
              Explore our chef-curated selection of fresh, seasonal dishes. Browse available items and sort by price below.
            </p>
          </div>
          <div className="hero-stat-pill">
            <span className="stat-num">{availableDishes.length}</span>
            <span className="stat-label">Available Dishes</span>
          </div>
        </section>

        {/* CONTROLS BAR: SEARCH & PRICE SORT */}
        <section className="controls-bar">
          {/* Search Box */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by dish name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Price Sort Controls */}
          <div className="sort-group">
            <span className="sort-label">Sort by Price:</span>
            <div className="sort-buttons">
              <button
                className={`sort-pill ${priceSort === "lowToHigh" ? "active" : ""}`}
                onClick={() =>
                  setPriceSort((prev) => (prev === "lowToHigh" ? "none" : "lowToHigh"))
                }
                title="Sort Price: Low to High"
              >
                <span className="sort-icon">▲</span> Low to High
              </button>

              <button
                className={`sort-pill ${priceSort === "highToLow" ? "active" : ""}`}
                onClick={() =>
                  setPriceSort((prev) => (prev === "highToLow" ? "none" : "highToLow"))
                }
                title="Sort Price: High to Low"
              >
                <span className="sort-icon">▼</span> High to Low
              </button>

              {priceSort !== "none" && (
                <button
                  className="sort-reset-btn"
                  onClick={() => setPriceSort("none")}
                  title="Reset to default order"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CATEGORY FILTER TABS */}
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "All" && "✨ "}
              {cat === "Starter" && "🥗 "}
              {cat === "Main Course" && "🍲 "}
              {cat === "Dessert" && "🍰 "}
              {cat === "Beverage" && "🍹 "}
              {cat}
            </button>
          ))}
        </div>

        {/* DISHES GRID (READ-ONLY) */}
        <section className="menu-grid-section">
          <div className="section-header">
            <h3>
              {selectedCategory === "All" ? "All Available Dishes" : selectedCategory}
              <span className="dish-count">({availableDishes.length})</span>
            </h3>
            {priceSort !== "none" && (
              <span className="active-sort-indicator">
                Sorted: {priceSort === "lowToHigh" ? "Price: Low to High" : "Price: High to Low"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading available menu selections...</p>
            </div>
          ) : availableDishes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h4>No dishes found</h4>
              <p>
                {searchQuery || selectedCategory !== "All"
                  ? "Try adjusting your search terms or category filter."
                  : "No dishes are currently marked as available. Please check back soon!"}
              </p>
              {(searchQuery || selectedCategory !== "All" || priceSort !== "none") && (
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setPriceSort("none");
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="dishes-grid">
              {availableDishes.map((item) => (
                <article className="dish-card" key={item._id}>
                  <div className="dish-card-header">
                    <span className="dish-category-badge">{item.category}</span>
                    <span className="dish-status-pill available">Available</span>
                  </div>

                  <div className="dish-body">
                    <h4 className="dish-title">{item.name}</h4>
                    <p className="dish-desc">
                      Freshly prepared with authentic ingredients, spices, and chef-level craftsmanship.
                    </p>
                  </div>

                  <div className="dish-footer">
                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="amount">{item.price}</span>
                    </div>
                    <span className="order-hint">Ready to order</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 The Grand Bistro • All Rights Reserved</p>
      </footer>
    </div>
  );
}

// =========================================================================
// 2. ADMIN PORTAL COMPONENT (PROTECTED ROUTE: /admin)
// Always requires login when hit!
// =========================================================================
function AdminPortal() {
  const navigate = useNavigate();

  // "when someone try to hit the /admin endpoint it will always ask for login"
  // isAuthenticated is always initialized to false on load
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Menu Management State
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Starter",
    available: true
  });
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Trigger toast
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 4000);
  };

  // Fetch all items when authenticated
  const fetchAdminItems = async () => {
    try {
      const res = await axios.get(MENU_API);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminItems();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    try {
      setLoginLoading(true);
      const res = await axios.post(`${AUTH_API}/login`, { email, password });
      setAuthToken(res.data.token);
      setAdminUser(res.data.user);
      setIsAuthenticated(true);
      setPassword("");
      showToast("success", "Logged in successfully as Administrator.");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken("");
    setAdminUser(null);
    setEditingId(null);
    setShowPasswordModal(false);
  };


  // Handle Menu Add / Update
  const handleMenuSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.price === "" || !formData.category) {
      showToast("error", "Please fill name, price, and category.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      available: Boolean(formData.available)
    };

    try {
      setFormSubmitting(true);
      const headers = { Authorization: `Bearer ${authToken}` };

      if (editingId) {
        const res = await axios.put(`${MENU_API}/${editingId}`, payload, { headers });
        setMenuItems((prev) =>
          prev.map((i) => (i._id === editingId ? res.data : i))
        );
        showToast("success", `"${payload.name}" updated successfully!`);
      } else {
        const res = await axios.post(MENU_API, payload, { headers });
        setMenuItems((prev) => [res.data, ...prev]);
        showToast("success", `"${payload.name}" added to menu!`);
      }

      setFormData({ name: "", price: "", category: "Starter", available: true });
      setEditingId(null);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        showToast("error", err.response?.data?.message || "Action failed.");
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.available
    });
    setEditingId(item._id);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`${MENU_API}/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMenuItems((prev) => prev.filter((i) => i._id !== id));
      showToast("success", `"${name}" deleted from menu.`);
      if (editingId === id) setEditingId(null);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        showToast("error", "Failed to delete item.");
      }
    }
  };

  // Quick 1-Click Availability Toggle
  const handleToggleAvailability = async (item) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const res = await axios.put(
        `${MENU_API}/${item._id}`,
        { available: !item.available },
        { headers }
      );
      setMenuItems((prev) =>
        prev.map((i) => (i._id === item._id ? res.data : i))
      );
      showToast(
        "success",
        `"${item.name}" is now ${!item.available ? "Available" : "Unavailable"}.`
      );
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        showToast("error", "Could not change availability.");
      }
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordStatus({ type: "error", message: "Please fill all fields." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.post(
        `${AUTH_API}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setPasswordStatus({ type: "success", message: res.data.message || "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus({ type: "", message: "" });
        showToast("success", "Password updated successfully.");
      }, 1500);
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to change password."
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* ADMIN NAVBAR */}
      <header className="navbar admin-nav">
        <div className="nav-brand">
          <span className="brand-logo">🔐</span>
          <div>
            <h1 className="brand-title">Admin Management Portal</h1>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {notification.message && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
          <span>{notification.message}</span>
        </div>
      )}

      <main className="content-container">
        {!isAuthenticated ? (
          /* =========================================================================
             LOGIN REQUIRED VIEW (ALWAYS SHOWN WHEN VISITING /admin FRESH)
             ========================================================================= */
          <section className="login-card-wrapper">
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon-badge">🔒</div>
                <h2>Authentication Required</h2>
                <p>You have reached the protected <code>/admin</code> endpoint. Please sign in to proceed.</p>
              </div>

              {loginError && (
                <div className="form-alert error">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="input-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn full-width"
                  disabled={loginLoading}
                >
                  {loginLoading ? "Authenticating..." : "Sign In to Admin Panel"}
                </button>
              </form>

            </div>
          </section>
        ) : (
          /* =========================================================================
             AUTHENTICATED ADMIN DASHBOARD
             ========================================================================= */
          <div className="admin-dashboard">
            {/* ADMIN BANNER */}
            <section className="admin-banner">
              <div className="admin-profile-info">
                <span className="admin-avatar">👑</span>
                <div>
                  <h3>Logged In as Administrator</h3>
                  <p>{adminUser?.email || "admin@gmail.com"}</p>
                </div>
              </div>

              <div className="admin-top-actions">
                <button
                  type="button"
                  className="action-pill-btn secondary"
                  onClick={() => {
                    setPasswordStatus({ type: "", message: "" });
                    setShowPasswordModal(true);
                  }}
                >
                  🔑 Change Password
                </button>

                <button
                  type="button"
                  className="action-pill-btn logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            </section>

            {/* TWO COLUMN CRUD WORKSPACE */}
            <div className="admin-grid-workspace">
              {/* LEFT: FORM */}
              <section className="admin-form-panel">
                <div className="panel-header">
                  <h4>{editingId ? "✏️ Edit Dish" : "➕ Add New Dish"}</h4>
                  {editingId && (
                    <button
                      className="text-cancel-btn"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", price: "", category: "Starter", available: true });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleMenuSubmit} className="menu-form">
                  <div className="input-group">
                    <label>Dish Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Butter Naan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        placeholder="60"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="Starter">Starter</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  <div className="checkbox-field">
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      />
                      <span className="switch-text">
                        {formData.available
                          ? "Available on Public Menu"
                          : "Unavailable (Hidden from Public Menu)"}
                      </span>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={formSubmitting}
                    >
                      {formSubmitting
                        ? "Saving..."
                        : editingId
                        ? "Update Menu Item"
                        : "Add to Menu"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: "", price: "", category: "Starter", available: true });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* RIGHT: ALL ITEMS INVENTORY */}
              <section className="admin-list-panel">
                <div className="panel-header">
                  <h4>
                    📋 All Menu Inventory
                    <span className="dish-count">({menuItems.length} Total)</span>
                  </h4>
                  <span className="admin-hint">Click status pill to toggle availability</span>
                </div>

                {menuItems.length === 0 ? (
                  <div className="empty-state compact">
                    <p>No dishes found. Add your first dish using the form on the left.</p>
                  </div>
                ) : (
                  <div className="admin-item-cards">
                    {menuItems.map((item) => (
                      <div
                        className={`admin-item-card ${!item.available ? "card-dimmed" : ""} ${
                          editingId === item._id ? "card-editing" : ""
                        }`}
                        key={item._id}
                      >
                        <div className="card-primary">
                          <div className="card-title-row">
                            <h5 className="item-name">{item.name}</h5>
                            <span className="admin-price">₹{item.price}</span>
                          </div>
                          <div className="card-meta-row">
                            <span className="meta-category">{item.category}</span>

                            <button
                              type="button"
                              className={`availability-toggle-btn ${
                                item.available ? "is-available" : "is-unavailable"
                              }`}
                              onClick={() => handleToggleAvailability(item)}
                              title="Click to toggle availability"
                            >
                              {item.available ? "● Available" : "○ Unavailable"}
                            </button>
                          </div>
                        </div>

                        <div className="card-admin-actions">
                          <button
                            type="button"
                            className="edit-icon-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit item"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="delete-icon-btn"
                            onClick={() => handleDelete(item._id, item.name)}
                            title="Delete item"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* CHANGE PASSWORD MODAL */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🔑 Change Admin Password</h3>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  ✕
                </button>
              </div>

              {passwordStatus.message && (
                <div className={`form-alert ${passwordStatus.type}`}>
                  <span>{passwordStatus.type === "success" ? "✅" : "⚠️"}</span>
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="modal-form">
                <div className="input-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>New Password (min 6 characters)</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Save New Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 The Grand Bistro</p>
      </footer>
    </div>
  );
}

// =========================================================================
// MAIN ROUTER CONTAINER
// =========================================================================
function App() {
  return (
    <Routes>
      <Route path="/" element={<UserMenu />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="*" element={<UserMenu />} />
    </Routes>
  );
}

export default App;