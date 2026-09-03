import { useEffect, useState } from "react";
import api from "../api/axios";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  subject: ""
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teachers");
      setTeachers(response.data.teachers);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load teachers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
    setEditingTeacher(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (editingTeacher) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject
        };

        await api.put(
          `/teachers/${editingTeacher._id}`,
          updateData
        );

        setMessage("Teacher updated successfully");
      } else {
        await api.post("/teachers", formData);
        setMessage("Teacher added successfully");
      }

      resetForm();
      fetchTeachers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save teacher"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);

    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      subject: teacher.subject || ""
    });

    setMessage("");
    setError("");
  };

  const handleDelete = async (teacherId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/teachers/${teacherId}`);
      setMessage("Teacher deleted successfully");

      if (editingTeacher?._id === teacherId) {
        resetForm();
      }

      fetchTeachers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete teacher"
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Teachers</h1>
          <p>Manage teachers and their details</p>
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
            {editingTeacher
              ? "Edit Teacher"
              : "Add Teacher"}
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
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {!editingTeacher && (
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Subject</label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingTeacher
                  ? "Update Teacher"
                  : "Add Teacher"}
              </button>

              {editingTeacher && (
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
          <h2>All Teachers</h2>

          {loading ? (
            <p>Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <p className="empty-message">
              No teachers found.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Phone</th>
                    <th>Class</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.subject}</td>
                      <td>{teacher.phone || "-"}</td>
                      <td>
                        {teacher.assignedClass?.name || "-"}
                      </td>
                      <td className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(teacher)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(teacher._id)
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

export default Teachers;