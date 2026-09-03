const Student = require("../models/Student");
const Class = require("../models/Class");

const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, classId, guardianContact } = req.body;

    if (!name || !rollNumber || !classId || !guardianContact) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const classExists = await Class.findById(classId);

    if (!classExists) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    const existingStudent = await Student.findOne({ rollNumber });

    if (existingStudent) {
      return res.status(400).json({
        message: "Roll number already exists"
      });
    }

    const student = await Student.create({
      name,
      rollNumber,
      class: classId,
      guardianContact
    });

    const populatedStudent = await Student.findById(student._id)
      .populate("class", "name grade section");

    res.status(201).json({
      message: "Student created successfully",
      student: populatedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student",
      error: error.message
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const { classId, section } = req.query;

    const filter = {};

    if (classId) {
      filter.class = classId;
    }

    if (section) {
      const matchingClasses = await Class.find({ section }).select("_id");

      filter.class = {
        $in: matchingClasses.map((schoolClass) => schoolClass._id)
      };
    }

    const students = await Student.find(filter)
      .populate("class", "name grade section")
      .sort({ rollNumber: 1 });

    res.status(200).json({
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("class", "name grade section");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      student
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: error.message
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const { name, rollNumber, classId, guardianContact } = req.body;

    if (rollNumber && rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({
        rollNumber,
        _id: { $ne: student._id }
      });

      if (existingStudent) {
        return res.status(400).json({
          message: "Roll number already exists"
        });
      }

      student.rollNumber = rollNumber;
    }

    if (classId) {
      const classExists = await Class.findById(classId);

      if (!classExists) {
        return res.status(404).json({
          message: "Class not found"
        });
      }

      student.class = classId;
    }

    if (name !== undefined) student.name = name;
    if (guardianContact !== undefined) {
      student.guardianContact = guardianContact;
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate("class", "name grade section");

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student",
      error: error.message
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await student.deleteOne();

    res.status(200).json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: error.message
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};