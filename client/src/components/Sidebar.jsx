import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>School ERP</h2>
      </div>

      <div className="sidebar-user">
        <p className="user-name">{user?.name}</p>
        <span>{user?.role}</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/">
          Dashboard
        </NavLink>

        {user?.role === "ADMIN" && (
          <>
            <NavLink to="/teachers">
              Teachers
            </NavLink>

            <NavLink to="/students">
              Students
            </NavLink>

            <NavLink to="/classes">
              Classes
            </NavLink>
          </>
        )}

        {user?.role === "TEACHER" && (
          <NavLink to="/attendance">
            Mark Attendance
          </NavLink>
        )}

        <NavLink to="/attendance-history">
          Attendance History
        </NavLink>
      </nav>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;