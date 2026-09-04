import { useEffect, useState } from "react";
import api from "../api/axios";

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [classId, setClassId] = useState("");
  const [attendanceSubmitted, setAttendanceSubmitted] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError("");

        const studentsResponse = await api.get("/students");

        const fetchedStudents =
          studentsResponse.data.students || [];

        setStudents(fetchedStudents);

        if (fetchedStudents.length === 0) {
          return;
        }

        const assignedClassId =
          fetchedStudents[0].class?._id || "";

        setClassId(assignedClassId);

        const initialAttendance = {};

        fetchedStudents.forEach((student) => {
          initialAttendance[student._id] = "PRESENT";
        });

        const today = getTodayDate();

        try {
          const attendanceResponse = await api.get(
            `/attendance?date=${today}`
          );

          const attendanceData =
            attendanceResponse.data.attendance || [];

          if (attendanceData.length > 0) {
            const todayAttendance = attendanceData.find(
              (item) =>
                item.class?._id === assignedClassId ||
                item.class === assignedClassId
            );

            if (todayAttendance) {
              todayAttendance.records.forEach((record) => {
                const studentId =
                  record.student?._id || record.student;

                if (studentId) {
                  initialAttendance[studentId] =
                    record.status;
                }
              });

              setAttendanceSubmitted(true);
              setMessage(
                "Today's attendance has already been submitted"
              );
            }
          }
        } catch (error) {
          console.error(
            "Failed to load attendance history",
            error
          );
        }

        setAttendance(initialAttendance);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load attendance data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleStatusChange = (studentId, status) => {
    if (attendanceSubmitted) {
      return;
    }

    setAttendance((previousAttendance) => ({
      ...previousAttendance,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    if (attendanceSubmitted) {
      return;
    }

    const updatedAttendance = {};

    students.forEach((student) => {
      updatedAttendance[student._id] = "PRESENT";
    });

    setAttendance(updatedAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (attendanceSubmitted) {
      setError(
        "Attendance has already been submitted for today"
      );
      return;
    }

    if (!classId || students.length === 0) {
      setError("No students found for your assigned class");
      return;
    }

    const records = students.map((student) => ({
      student: student._id,
      status: attendance[student._id] || "PRESENT"
    }));

    setSubmitting(true);

    try {
      await api.post("/attendance", {
        classId,
        records
      });

      setAttendanceSubmitted(true);

      setMessage(
        "Attendance marked successfully"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to mark attendance"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header attendance-header">
        <div>
          <h1>Mark Attendance</h1>

          <p>
            {attendanceSubmitted
              ? "Today's attendance has already been submitted"
              : "Mark attendance for your assigned class"}
          </p>
        </div>

        {students.length > 0 && !attendanceSubmitted && (
          <button
            type="button"
            className="secondary-button"
            onClick={markAllPresent}
          >
            Mark All Present
          </button>
        )}
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

      {students.length === 0 ? (
        <div className="empty-message">
          No students found in your assigned class.
        </div>
      ) : (
        <div className="list-card">
          <div className="attendance-class-info">
            <h2>{students[0].class?.name}</h2>

            <p>
              Grade {students[0].class?.grade} - Section{" "}
              {students[0].class?.section}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const currentStatus =
                      attendance[student._id] || "PRESENT";

                    return (
                      <tr key={student._id}>
                        <td>{student.rollNumber}</td>

                        <td>{student.name}</td>

                        <td>
                          <div className="attendance-actions">
                            <button
                              type="button"
                              disabled={attendanceSubmitted}
                              className={
                                currentStatus === "PRESENT"
                                  ? "attendance-present active"
                                  : "attendance-present"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  student._id,
                                  "PRESENT"
                                )
                              }
                            >
                              {currentStatus === "PRESENT"
                                ? "✓ Present"
                                : "Present"}
                            </button>

                            <button
                              type="button"
                              disabled={attendanceSubmitted}
                              className={
                                currentStatus === "ABSENT"
                                  ? "attendance-absent active"
                                  : "attendance-absent"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  student._id,
                                  "ABSENT"
                                )
                              }
                            >
                              {currentStatus === "ABSENT"
                                ? "✕ Absent"
                                : "Absent"}
                            </button>

                            <span
                              className={
                                currentStatus === "PRESENT"
                                  ? "attendance-status present-status"
                                  : "attendance-status absent-status"
                              }
                            >
                              {currentStatus === "PRESENT"
                                ? "Marked Present"
                                : "Marked Absent"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!attendanceSubmitted && (
              <div className="form-actions attendance-submit">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Attendance"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Attendance;