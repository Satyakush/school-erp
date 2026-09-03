const express = require("express");
const {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher
} = require("../controllers/teacherController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("ADMIN"), getTeachers)
  .post(protect, authorize("ADMIN"), createTeacher);

router
  .route("/:id")
  .put(protect, authorize("ADMIN"), updateTeacher)
  .delete(protect, authorize("ADMIN"), deleteTeacher);

module.exports = router;