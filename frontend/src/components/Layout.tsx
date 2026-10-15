import { Link, Outlet, useNavigate } from "react-router-dom";
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
        <Link to="/dashboard" className="brand">Retain</Link>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          <button onClick={handleSignout}>Sign out ({user?.name})</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}