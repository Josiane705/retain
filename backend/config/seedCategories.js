const Category = require("../models/Category");

const starters = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Education", "Shopping"];

const seedCategories = async () => {
  // The default category always exists
  await Category.updateOne(
    { name: "Uncategorized" },
    { $setOnInsert: { name: "Uncategorized", isDefault: true } },
    { upsert: true }
  );

  // Starter categories only on a fresh database
  const count = await Category.countDocuments();
  if (count === 1) {
    await Category.insertMany(starters.map((name) => ({ name })));
    console.log("Starter categories created");
  }
};

module.exports = seedCategories;