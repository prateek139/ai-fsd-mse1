const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    productCode: {
      type: String,
      required: [true, "Product code is required"],
      unique: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Food", "Furniture", "Other"],
      default: "Other"
    },
    supplierName: {
      type: String,
      trim: true,
      default: ""
    },
    quantityInStock: {
      type: Number,
      default: 0,
      min: [0, "Quantity in stock cannot be negative"]
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: [0, "Reorder level cannot be negative"]
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, "Unit price cannot be negative"]
    },
    manufactureDate: {
      type: Date
    },
    productType: {
      type: String,
      enum: ["Perishable", "Non-Perishable"],
      default: "Non-Perishable"
    },
    status: {
      type: String,
      enum: ["Available", "Out of Stock"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate a readable unique productId before saving.
productSchema.pre("save", function (next) {
  if (!this.productId) {
    this.productId = `PID-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
