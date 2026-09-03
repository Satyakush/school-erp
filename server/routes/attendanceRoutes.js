const express = require("express");
const {
  markAttendance,
  getAttendanceHistory
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("TEACHER"),
  markAttendance
);

router.get(
  "/",
  protect,
  authorize("ADMIN", "TEACHER"),
  getAttendanceHistory
);

module.exports = router;