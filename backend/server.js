require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedCategories = require("./config/seedCategories");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Retain API running" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  await seedCategories();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});