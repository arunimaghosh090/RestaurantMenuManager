import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    available: true
  });

  // Menu items state
  const [menuItems, setMenuItems] = useState([]);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // API URL
  const API_URL = "http://localhost:5000/menuItems";


  // =====================================
  // GET ALL MENU ITEMS
  // =====================================
  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      alert("Could not fetch menu items");
    } finally {
      setLoading(false);
    }
  };


  // =====================================
  // FETCH DATA WHEN PAGE LOADS
  // =====================================
  useEffect(() => {
    fetchMenuItems();
  }, []);


  // =====================================
  // HANDLE INPUT
  // =====================================
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };


  // =====================================
  // CREATE / UPDATE
  // =====================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill all required fields");
      return;
    }

    try {

      if (editingId) {

        // UPDATE
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          {
            name: formData.name,
            price: Number(formData.price),
            category: formData.category,
            available: formData.available
          }
        );

        setMenuItems(
          menuItems.map((item) =>
            item._id === editingId ? response.data : item
          )
        );

        alert("Menu item updated successfully");

      } else {

        // CREATE
        const response = await axios.post(
          API_URL,
          {
            name: formData.name,
            price: Number(formData.price),
            category: formData.category,
            available: formData.available
          }
        );

        setMenuItems([...menuItems, response.data]);

        alert("Menu item added successfully");
      }

      // Reset form
      setFormData({
        name: "",
        price: "",
        category: "",
        available: true
      });

      setEditingId(null);

    } catch (error) {
      console.error("Error saving menu item:", error);
      alert(
        error.response?.data?.error ||
        "Something went wrong"
      );
    }
  };


  // =====================================
  // EDIT
  // =====================================
  const handleEdit = (item) => {

    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.available
    });

    setEditingId(item._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =====================================
  // DELETE
  // =====================================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await axios.delete(`${API_URL}/${id}`);

      setMenuItems(
        menuItems.filter((item) => item._id !== id)
      );

      alert("Menu item deleted successfully");

    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Could not delete menu item");
    }
  };


  // =====================================
  // CANCEL EDIT
  // =====================================
  const handleCancel = () => {

    setFormData({
      name: "",
      price: "",
      category: "",
      available: true
    });

    setEditingId(null);
  };


  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>🍽️ Restaurant Menu Manager</h1>
        <p>Manage your restaurant menu easily</p>
      </header>


      {/* MAIN CONTAINER */}
      <main className="container">

        {/* FORM SECTION */}
        <section className="form-section">

          <h2>
            {editingId
              ? "✏️ Update Menu Item"
              : "➕ Add Menu Item"}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="form-group">
              <label>Item Name *</label>

              <input
                type="text"
                name="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>


            {/* PRICE */}
            <div className="form-group">
              <label>Price *</label>

              <input
                type="number"
                name="price"
                placeholder="Enter price"
                min="0"
                value={formData.price}
                onChange={handleChange}
              />
            </div>


            {/* CATEGORY */}
            <div className="form-group">
              <label>Category *</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">
                  Select Category
                </option>

                <option value="Starter">
                  Starter
                </option>

                <option value="Main Course">
                  Main Course
                </option>

                <option value="Dessert">
                  Dessert
                </option>

                <option value="Beverage">
                  Beverage
                </option>
              </select>
            </div>


            {/* AVAILABLE */}
            <div className="checkbox-group">

              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                id="available"
              />

              <label htmlFor="available">
                Available
              </label>

            </div>


            {/* BUTTONS */}
            <div className="button-group">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingId
                  ? "Update Item"
                  : "Add Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>


        {/* MENU LIST */}
        <section className="menu-section">

          <div className="menu-header">

            <h2>📋 Menu Items</h2>

            <span className="count">
              {menuItems.length} Items
            </span>

          </div>


          {loading ? (
            <p className="message">
              Loading menu items...
            </p>
          ) : menuItems.length === 0 ? (

            <p className="message">
              No menu items available.
            </p>

          ) : (

            <div className="menu-grid">

              {menuItems.map((item) => (

                <div
                  className="menu-card"
                  key={item._id}
                >

                  <div className="card-top">

                    <h3>{item.name}</h3>

                    <span className="price">
                      ₹{item.price}
                    </span>

                  </div>


                  <p className="category">
                    {item.category}
                  </p>


                  <p>
                    Status:

                    <span
                      className={
                        item.available
                          ? "available"
                          : "not-available"
                      }
                    >
                      {item.available
                        ? " Available"
                        : " Not Available"}
                    </span>

                  </p>


                  <div className="card-buttons">

                    <button
                      className="edit-btn"
                      onClick={() =>
                        handleEdit(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(item._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* FOOTER */}
      <footer>
        <p>
          © 2026 Restaurant Menu Manager
        </p>
      </footer>

    </div>
  );
}

export default App;