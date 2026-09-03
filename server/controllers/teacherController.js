const User = require("../models/User");
const Class = require("../models/Class");

const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, subject, assignedClass } = req.body;

    if (!name || !email || !password || !subject) {
      return res.status(400).json({
        message: "Name, email, password and subject are required"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already in use"
      });
    }

    if (assignedClass) {
      const classExists = await Class.findById(assignedClass);

      if (!classExists) {
        return res.status(404).json({
          message: "Assigned class not found"
        });
      }
    }

    const teacher = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      subject,
      assignedClass: assignedClass || null,
      role: "TEACHER"
    });

    if (assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, {
        classTeacher: teacher._id
      });
    }

    const teacherData = teacher.toObject();
    delete teacherData.password;

    res.status(201).json({
      message: "Teacher created successfully",
      teacher: teacherData
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create teacher",
      error: error.message
    });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "TEACHER" })
      .select("-password")
      .populate("assignedClass", "name grade section")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: teachers.length,
      teachers
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch teachers",
      error: error.message
    });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "TEACHER"
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    const { name, email, phone, subject, assignedClass } = req.body;

    if (email && email.toLowerCase() !== teacher.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: teacher._id }
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email is already in use"
        });
      }

      teacher.email = email.toLowerCase();
    }

    if (assignedClass) {
      const classExists = await Class.findById(assignedClass);

      if (!classExists) {
        return res.status(404).json({
          message: "Assigned class not found"
        });
      }
    }

    if (teacher.assignedClass) {
      await Class.findByIdAndUpdate(teacher.assignedClass, {
        classTeacher: null
      });
    }

    if (name !== undefined) teacher.name = name;
    if (phone !== undefined) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (assignedClass !== undefined) {
      teacher.assignedClass = assignedClass || null;
    }

    await teacher.save();

    if (assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, {
        classTeacher: teacher._id
      });
    }

    const updatedTeacher = await User.findById(teacher._id)
      .select("-password")
      .populate("assignedClass", "name grade section");

    res.status(200).json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update teacher",
      error: error.message
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
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

    await teacher.deleteOne();

    res.status(200).json({
      message: "Teacher deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete teacher",
      error: error.message
    });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher
};