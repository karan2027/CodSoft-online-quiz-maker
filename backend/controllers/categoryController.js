const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Quiz = require("../models/Quiz");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const subcategoryCount = await Subcategory.countDocuments({ category: cat._id });
        const quizCount = await Quiz.countDocuments({ category: cat.name, status: "published", isPublic: true });

        return {
          ...cat,
          subcategoryCount,
          quizCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getSubcategoriesByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const subcategories = await Subcategory.find({ category: category._id }).sort({ name: 1 }).lean();

    const subcategoriesWithCounts = await Promise.all(
      subcategories.map(async (subcat) => {
        const quizCount = await Quiz.countDocuments({
          category: category.name,
          subcategory: subcat.name,
          status: "published",
          isPublic: true,
        });

        return {
          ...subcat,
          quizCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: subcategoriesWithCounts,
    });
  } catch (error) {
    console.error("Get Subcategories Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getCategories,
  getSubcategoriesByCategory,
};
