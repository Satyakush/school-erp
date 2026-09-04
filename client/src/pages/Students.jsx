import { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = {
  name: "",
  rollNumber: "",
  classId: "",
  guardianContact: ""
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [studentsResponse, classesResponse] = await Promise.all([
        api.get("/students"),
        api.get("/classes")
      ]);

      setStudents(studentsResponse.data.students);
      setClasses(classesResponse.data.classes);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load student data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (editingStudent) {
        await api.put(
          `/students/${editingStudent._id}`,
          formData
        );

        setMessage("Student updated successfully");
      } else {
        await api.post("/students", formData);

        setMessage("Student added successfully");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save student"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      name: student.name || "",
      rollNumber: student.rollNumber || "",
      classId: student.class?._id || "",
      guardianContact: student.guardianContact || ""
    });

    setError("");
    setMessage("");
  };

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/students/${studentId}`);

      setMessage("Student deleted successfully");

      if (editingStudent?._id === studentId) {
        resetForm();
      }

      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage students and their class assignments</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="management-grid">
        <div className="form-card">
          <h2>
            {editingStudent
              ? "Edit Student"
              : "Add Student"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Roll Number</label>

              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Guardian Contact</label>

              <input
                type="text"
                name="guardianContact"
                value={formData.guardianContact}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Class</label>

              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select a class
                </option>

                {classes.map((schoolClass) => (
                  <option
                    key={schoolClass._id}
                    value={schoolClass._id}
                  >
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingStudent
                  ? "Update Student"
                  : "Add Student"}
              </button>

              {editingStudent && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-card">
          <h2>All Students</h2>

          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p className="empty-message">
              No students found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll Number</th>
                    <th>Guardian Contact</th>
                    <th>Class</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.guardianContact}</td>
                      <td>
                        {student.class?.name || "Not assigned"}
                      </td>

                      <td className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(student._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;