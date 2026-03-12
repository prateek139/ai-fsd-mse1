const Product = require("../models/Product");

// @desc    Add a new product
// @route   POST /api/products
// @access  Public
const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

// @desc    Get one product by MongoDB _id
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
      error: error.message
    });
  }
};

// @desc    Update product by MongoDB _id
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
};

// @desc    Delete product by MongoDB _id
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
