const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const menuItemRoutes = require("./routes/menuItemRoutes");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/menuItems", menuItemRoutes);
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Restaurant Menu Manager API is running");
});

// Helper function to seed default admin if not exists
const initializeAdmin = async () => {
  try {
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const defaultPassword = "1234567890";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });

      console.log(`Default admin initialized: ${adminEmail}`);
    } else {
      console.log(`Admin account exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error("Error checking/initializing default admin:", err.message);
  }
};

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

    await initializeAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });