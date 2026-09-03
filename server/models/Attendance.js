const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      required: true
    }
  },
  {
    _id: false
  }
);

const attendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    records: {
      type: [attendanceRecordSchema],
      required: true
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);