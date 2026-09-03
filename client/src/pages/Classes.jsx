import { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = {
  name: "",
  grade: "",
  section: "",
  classTeacher: ""
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingClass, setEditingClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [classesResponse, teachersResponse] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers")
      ]);

      setClasses(classesResponse.data.classes);
      setTeachers(teachersResponse.data.teachers);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load data"
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
    setEditingClass(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        classTeacher: formData.classTeacher || null
      };

      if (editingClass) {
        await api.put(
          `/classes/${editingClass._id}`,
          payload
        );

        setMessage("Class updated successfully");
      } else {
        await api.post("/classes", payload);

        setMessage("Class created successfully");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save class"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (schoolClass) => {
    setEditingClass(schoolClass);

    setFormData({
      name: schoolClass.name || "",
      grade: schoolClass.grade || "",
      section: schoolClass.section || "",
      classTeacher:
        schoolClass.classTeacher?._id || ""
    });

    setError("");
    setMessage("");
  };

  const handleDelete = async (classId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/classes/${classId}`);

      setMessage("Class deleted successfully");

      if (editingClass?._id === classId) {
        resetForm();
      }

      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete class"
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>Manage classes and assign class teachers</p>
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
            {editingClass
              ? "Edit Class"
              : "Add Class"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Class Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Grade 6-A"
                required
              />
            </div>

            <div className="form-group">
              <label>Grade</label>

              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Section</label>

              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                placeholder="A"
                required
              />
            </div>

            <div className="form-group">
              <label>Class Teacher</label>

              <select
                name="classTeacher"
                value={formData.classTeacher}
                onChange={handleChange}
              >
                <option value="">
                  No class teacher assigned
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher._id}
                    value={teacher._id}
                  >
                    {teacher.name} - {teacher.subject}
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
                  : editingClass
                  ? "Update Class"
                  : "Add Class"}
              </button>

              {editingClass && (
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
          <h2>All Classes</h2>

          {loading ? (
            <p>Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="empty-message">
              No classes found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Section</th>
                    <th>Class Teacher</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {classes.map((schoolClass) => (
                    <tr key={schoolClass._id}>
                      <td>{schoolClass.name}</td>
                      <td>{schoolClass.grade}</td>
                      <td>{schoolClass.section}</td>

                      <td>
                        {schoolClass.classTeacher?.name ||
                          "Not assigned"}
                      </td>

                      <td className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(schoolClass)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              schoolClass._id
                            )
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

export default Classes;