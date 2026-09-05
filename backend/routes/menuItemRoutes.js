const express = require("express");
const router = express.Router();

const MenuItem = require("../models/MenuItem");

// ===============================
// GET ALL MENU ITEMS
// GET /menuItems
// ===============================
router.get("/", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching menu items",
      error: error.message
    });
  }
});


// ===============================
// GET MENU ITEM BY ID
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
// CREATE MENU ITEM
// POST /menuItems
// ===============================
router.post("/", async (req, res) => {
  try {
    const { name, price, category, available } = req.body;

    const menuItem = new MenuItem({
      name,
      price,
      category,
      available
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
// UPDATE MENU ITEM
// PUT /menuItems/:id
// ===============================
router.put("/:id", async (req, res) => {
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
// DELETE MENU ITEM
// DELETE /menuItems/:id
// ===============================
router.delete("/:id", async (req, res) => {
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