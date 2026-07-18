const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ensure subcategory names are unique per category
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", SubcategorySchema);
