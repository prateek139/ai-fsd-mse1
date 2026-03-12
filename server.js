const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();

// Connect database before starting server.
connectDB();

// Middleware to parse JSON request bodies.
app.use(express.json());

// Serve frontend assets from the public directory.
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Product Inventory API is running" });
});

app.use("/api/products", productRoutes);

// Global handler for undefined routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
