import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignout = () => {
    signout();
    navigate("/signin");
  };

  return (
    <>
      <nav className="navbar">
        <NavLink to="/dashboard" className="brand">
          Retain
        </NavLink>
        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          <button onClick={handleSignout}>Sign out ({user?.name})</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}