import { useEffect, useState } from "react";
import api from "../api/axios";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data"
        );
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!data) {
    return <p>Loading dashboard...</p>;
  }

  if (data.role === "TEACHER") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>My Dashboard</h1>
            <p>Overview of your assigned class</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>My Class</p>
            <h2>{data.class?.name}</h2>
          </div>

          <div className="stat-card">
            <p>Total Students</p>
            <h2>{data.totalStudents}</h2>
          </div>

          <div className="stat-card">
            <p>Attendance Today</p>
            <h2>
              {data.todayAttendance.marked
                ? `${data.todayAttendance.presentCount}/${data.totalStudents}`
                : "Not Marked"}
            </h2>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Today's Attendance</h2>

          {data.todayAttendance.marked ? (
            <div className="attendance-summary">
              <p>
                Present:{" "}
                <strong>{data.todayAttendance.presentCount}</strong>
              </p>

              <p>
                Absent:{" "}
                <strong>{data.todayAttendance.absentCount}</strong>
              </p>
            </div>
          ) : (
            <p className="empty-message">
              Attendance has not been marked today.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your school</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Students</p>
          <h2>{data.totalStudents}</h2>
        </div>

        <div className="stat-card">
          <p>Total Teachers</p>
          <h2>{data.totalTeachers}</h2>
        </div>

        <div className="stat-card">
          <p>Total Classes</p>
          <h2>{data.totalClasses}</h2>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Today's Attendance</h2>

        {data.todayAttendance.length === 0 ? (
          <p className="empty-message">
            No attendance has been marked today.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Present</th>
                  <th>Absent</th>
                </tr>
              </thead>

              <tbody>
                {data.todayAttendance.map((item) => (
                  <tr key={item.class?._id}>
                    <td>{item.class?.name}</td>
                    <td>{item.totalStudents}</td>
                    <td>{item.presentCount}</td>
                    <td>{item.absentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;