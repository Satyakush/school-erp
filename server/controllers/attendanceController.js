const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const markAttendance = async (req, res) => {
  try {
    const { classId, records } = req.body;

    if (!classId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "Class and attendance records are required"
      });
    }

    const teacherClassId = req.user.assignedClass?.toString();

    if (
      req.user.role === "TEACHER" &&
      teacherClassId !== classId
    ) {
      return res.status(403).json({
        message: "You can only mark attendance for your assigned class"
      });
    }

    const students = await Student.find({
      class: classId
    }).select("_id");

    if (students.length === 0) {
      return res.status(400).json({
        message: "No students found in this class"
      });
    }

    const studentIds = students.map((student) =>
      student._id.toString()
    );

    const submittedStudentIds = records.map((record) =>
      record.student.toString()
    );

    const uniqueSubmittedIds = new Set(submittedStudentIds);

    if (
      uniqueSubmittedIds.size !== studentIds.length ||
      !studentIds.every((id) => uniqueSubmittedIds.has(id))
    ) {
      return res.status(400).json({
        message: "Attendance must be submitted for every student exactly once"
      });
    }

    const invalidStatus = records.some(
      (record) =>
        !["PRESENT", "ABSENT"].includes(record.status)
    );

    if (invalidStatus) {
      return res.status(400).json({
        message: "Invalid attendance status"
      });
    }

    const date = getTodayDate();

    const existingAttendance = await Attendance.findOne({
      class: classId,
      date
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance has already been marked for this class today"
      });
    }

    const attendance = await Attendance.create({
      class: classId,
      date,
      records
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark attendance",
      error: error.message
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { classId, studentId, date } = req.query;

    const filter = {};

    if (classId) {
      filter.class = classId;
    }

    if (date) {
      filter.date = date;
    }

    if (req.user.role === "TEACHER") {
      filter.class = req.user.assignedClass;

      if (!req.user.assignedClass) {
        return res.status(400).json({
          message: "No class assigned to this teacher"
        });
      }
    }

    let attendanceRecords = await Attendance.find(filter)
      .populate("class", "name grade section")
      .populate("records.student", "name rollNumber")
      .sort({ date: -1 });

    if (studentId) {
      attendanceRecords = attendanceRecords
        .map((attendance) => {
          const matchingRecords = attendance.records.filter(
            (record) =>
              record.student &&
              record.student._id.toString() === studentId
          );

          if (matchingRecords.length === 0) {
            return null;
          }

          return {
            ...attendance.toObject(),
            records: matchingRecords
          };
        })
        .filter(Boolean);
    }

    res.status(200).json({
      count: attendanceRecords.length,
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance history",
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getAttendanceHistory
};