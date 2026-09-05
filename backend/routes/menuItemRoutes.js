const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItem");
const authMiddleware = require("../middleware/authMiddleware");

// ===============================
// GET ALL MENU ITEMS (PUBLIC)
// GET /menuItems
// Query options:
//   ?available=true (filter by availability)
//   ?sort=price_asc | price_desc
// ===============================
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.available === "true") {
      filter.available = true;
    }

    let query = MenuItem.find(filter);

    if (req.query.sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (req.query.sort === "price_desc") {
      query = query.sort({ price: -1 });
    }

    const menuItems = await query.exec();

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching menu items",
      error: error.message
    });
  }
});


// ===============================
// GET MENU ITEM BY ID (PUBLIC)
// GET /menuItems/:id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json(menuItem);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching menu item",
      error: error.message
    });
  }
});


// ===============================
// CREATE MENU ITEM (PROTECTED - ADMIN ONLY)
// POST /menuItems
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, price, category, available } = req.body;

    const menuItem = new MenuItem({
      name,
      price,
      category,
      available: available !== undefined ? available : true
    });

    const savedItem = await menuItem.save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: "Error creating menu item",
      error: error.message
    });
  }
});


// ===============================
// UPDATE MENU ITEM (PROTECTED - ADMIN ONLY)
// PUT /menuItems/:id
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: "Error updating menu item",
      error: error.message
    });
  }
});


// ===============================
// DELETE MENU ITEM (PROTECTED - ADMIN ONLY)
// DELETE /menuItems/:id
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        message: "Menu item not found"
      });
    }

    res.status(200).json({
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting menu item",
      error: error.message
    });
  }
});

module.exports = router;