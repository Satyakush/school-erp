const express = require("express");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("ADMIN", "TEACHER"), getStudents)
  .post(protect, authorize("ADMIN"), createStudent);

router
  .route("/:id")
  .get(protect, authorize("ADMIN"), getStudentById)
  .put(protect, authorize("ADMIN"), updateStudent)
  .delete(protect, authorize("ADMIN"), deleteStudent);

module.exports = router;