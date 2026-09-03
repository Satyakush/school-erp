const Class = require("../models/Class");
const User = require("../models/User");
const Student = require("../models/Student");

const createClass = async (req, res) => {
  try {
    const { name, grade, section, classTeacher } = req.body;

    if (!name || !grade || !section) {
      return res.status(400).json({
        message: "Name, grade and section are required"
      });
    }

    const existingClass = await Class.findOne({
      grade,
      section
    });

    if (existingClass) {
      return res.status(400).json({
        message: "Class with this grade and section already exists"
      });
    }

    if (classTeacher) {
      const teacher = await User.findOne({
        _id: classTeacher,
        role: "TEACHER"
      });

      if (!teacher) {
        return res.status(404).json({
          message: "Teacher not found"
        });
      }

      if (teacher.assignedClass) {
        await Class.findByIdAndUpdate(teacher.assignedClass, {
          classTeacher: null
        });
      }
    }

    const newClass = await Class.create({
      name,
      grade,
      section,
      classTeacher: classTeacher || null
    });

    if (classTeacher) {
      await User.findByIdAndUpdate(classTeacher, {
        assignedClass: newClass._id
      });
    }

    const populatedClass = await Class.findById(newClass._id)
      .populate("classTeacher", "name email subject phone");

    res.status(201).json({
      message: "Class created successfully",
      class: populatedClass
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create class",
      error: error.message
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("classTeacher", "name email subject phone")
      .sort({ grade: 1, section: 1 });

    res.status(200).json({
      count: classes.length,
      classes
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch classes",
      error: error.message
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const schoolClass = await Class.findById(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    const { name, grade, section, classTeacher } = req.body;

    if (grade !== undefined || section !== undefined) {
      const newGrade = grade !== undefined ? grade : schoolClass.grade;
      const newSection = section !== undefined ? section : schoolClass.section;

      const duplicateClass = await Class.findOne({
        grade: newGrade,
        section: newSection,
        _id: { $ne: schoolClass._id }
      });

      if (duplicateClass) {
        return res.status(400).json({
          message: "Class with this grade and section already exists"
        });
      }
    }

    if (classTeacher !== undefined) {
      if (schoolClass.classTeacher) {
        await User.findByIdAndUpdate(schoolClass.classTeacher, {
          assignedClass: null
        });
      }

      if (classTeacher) {
        const teacher = await User.findOne({
          _id: classTeacher,
          role: "TEACHER"
        });

        if (!teacher) {
          return res.status(404).json({
            message: "Teacher not found"
          });
        }

        if (teacher.assignedClass) {
          await Class.findByIdAndUpdate(teacher.assignedClass, {
            classTeacher: null
          });
        }

        teacher.assignedClass = schoolClass._id;
        await teacher.save();

        schoolClass.classTeacher = teacher._id;
      } else {
        schoolClass.classTeacher = null;
      }
    }

    if (name !== undefined) schoolClass.name = name;
    if (grade !== undefined) schoolClass.grade = grade;
    if (section !== undefined) schoolClass.section = section;

    await schoolClass.save();

    const updatedClass = await Class.findById(schoolClass._id)
      .populate("classTeacher", "name email subject phone");

    res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update class",
      error: error.message
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const schoolClass = await Class.findById(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    const studentCount = await Student.countDocuments({
      class: schoolClass._id
    });

    if (studentCount > 0) {
      return res.status(400).json({
        message: "Cannot delete a class that still has students assigned"
      });
    }

    if (schoolClass.classTeacher) {
      await User.findByIdAndUpdate(schoolClass.classTeacher, {
        assignedClass: null
      });
    }

    await schoolClass.deleteOne();

    res.status(200).json({
      message: "Class deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete class",
      error: error.message
    });
  }
};

module.exports = {
  createClass,
  getClasses,
  updateClass,
  deleteClass
};