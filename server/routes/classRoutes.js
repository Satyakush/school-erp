const express = require("express");
const {
  createClass,
  getClasses,
  updateClass,
  deleteClass
} = require("../controllers/classController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getClasses)
  .post(protect, authorize("ADMIN"), createClass);

router
  .route("/:id")
  .put(protect, authorize("ADMIN"), updateClass)
  .delete(protect, authorize("ADMIN"), deleteClass);

module.exports = router;