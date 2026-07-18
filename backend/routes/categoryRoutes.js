const express = require("express");
const router = express.Router();

const {
  getCategories,
  getSubcategoriesByCategory,
} = require("../controllers/categoryController");

// Get all categories
router.get("/", getCategories);

// Get subcategories by category name
router.get("/:categoryName/subcategories", getSubcategoriesByCategory);

module.exports = router;
