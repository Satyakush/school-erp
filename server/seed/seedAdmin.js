const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@school.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      name: "School Admin",
      email: "admin@school.com",
      password: "Admin123",
      role: "ADMIN"
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();