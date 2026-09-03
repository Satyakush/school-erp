const Student = require("../models/Student");
const User = require("../models/User");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const getDashboardStats = async (req, res) => {
  try {
    const date = getTodayDate();

    if (req.user.role === "TEACHER") {
      if (!req.user.assignedClass) {
        return res.status(400).json({
          message: "No class assigned to this teacher"
        });
      }

      const classId = req.user.assignedClass;

      const [schoolClass, totalStudents, todayAttendance] =
        await Promise.all([
          Class.findById(classId).populate(
            "classTeacher",
            "name email subject"
          ),
          Student.countDocuments({ class: classId }),
          Attendance.findOne({
            class: classId,
            date
          })
        ]);

      if (!schoolClass) {
        return res.status(404).json({
          message: "Assigned class not found"
        });
      }

      let presentCount = 0;
      let absentCount = 0;

      if (todayAttendance) {
        presentCount = todayAttendance.records.filter(
          (record) => record.status === "PRESENT"
        ).length;

        absentCount = todayAttendance.records.filter(
          (record) => record.status === "ABSENT"
        ).length;
      }

      return res.status(200).json({
        role: "TEACHER",
        class: schoolClass,
        totalStudents,
        todayAttendance: {
          marked: !!todayAttendance,
          presentCount,
          absentCount
        }
      });
    }

    const [totalStudents, totalTeachers, totalClasses] =
      await Promise.all([
        Student.countDocuments(),
        User.countDocuments({ role: "TEACHER" }),
        Class.countDocuments()
      ]);

    const todayAttendance = await Attendance.find({ date })
      .populate("class", "name grade section");

    const attendanceSummary = todayAttendance.map((attendance) => {
      const presentCount = attendance.records.filter(
        (record) => record.status === "PRESENT"
      ).length;

      const absentCount = attendance.records.filter(
        (record) => record.status === "ABSENT"
      ).length;

      return {
        class: attendance.class,
        totalStudents: attendance.records.length,
        presentCount,
        absentCount
      };
    });

    res.status(200).json({
      role: "ADMIN",
      totalStudents,
      totalTeachers,
      totalClasses,
      todayAttendance: attendanceSummary
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};