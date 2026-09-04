import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AttendanceHistory = () => {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    if (user?.role !== "ADMIN") {
      return;
    }

    try {
      const response = await api.get("/classes");
      setClasses(response.data.classes || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load classes"
      );
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (selectedClass && user?.role === "ADMIN") {
        params.append("classId", selectedClass);
      }

      if (selectedDate) {
        params.append("date", selectedDate);
      }

      const queryString = params.toString();

      const response = await api.get(
        queryString
          ? `/attendance?${queryString}`
          : "/attendance"
      );

      setAttendance(response.data.attendance || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load attendance history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, selectedDate, user]);

  const handleClearFilters = () => {
    setSelectedClass("");
    setSelectedDate("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Attendance History</h1>
          <p>
            {user?.role === "ADMIN"
              ? "View attendance records across all classes"
              : "View attendance records for your assigned class"}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="list-card">
        <div className="attendance-history-filters">
          {user?.role === "ADMIN" && (
            <div className="filter-group">
              <label>Class</label>

              <select
                value={selectedClass}
                onChange={(e) =>
                  setSelectedClass(e.target.value)
                }
              >
                <option value="">
                  All Classes
                </option>

                {classes.map((schoolClass) => (
                  <option
                    key={schoolClass._id}
                    value={schoolClass._id}
                  >
                    {schoolClass.name} - Grade{" "}
                    {schoolClass.grade} Section{" "}
                    {schoolClass.section}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Date</label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
            />
          </div>

          {(selectedClass || selectedDate) && (
            <button
              type="button"
              className="secondary-button clear-filter-button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading attendance history...</p>
        ) : attendance.length === 0 ? (
          <p className="empty-message">
            No attendance records found.
          </p>
        ) : (
          <div className="attendance-history-list">
            {attendance.map((attendanceItem) => (
              <div
                className="attendance-history-card"
                key={attendanceItem._id}
              >
                <div className="attendance-history-card-header">
                  <div>
                    <h3>
                      {attendanceItem.class?.name ||
                        "Unknown Class"}
                    </h3>

                    <p>
                      Grade{" "}
                      {attendanceItem.class?.grade} - Section{" "}
                      {attendanceItem.class?.section}
                    </p>
                  </div>

                  <div className="attendance-date">
                    {attendanceItem.date}
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {attendanceItem.records.map(
                        (record) => (
                          <tr
                            key={
                              record.student?._id ||
                              record.student
                            }
                          >
                            <td>
                              {record.student?.rollNumber ||
                                "-"}
                            </td>

                            <td>
                              {record.student?.name ||
                                "Unknown Student"}
                            </td>

                            <td>
                              <span
                                className={
                                  record.status === "PRESENT"
                                    ? "status-badge present-badge"
                                    : "status-badge absent-badge"
                                }
                              >
                                {record.status === "PRESENT"
                                  ? "Present"
                                  : "Absent"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;