import { Heart, LogOut, Menu, Plus, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link className="logo" to="/">
          <span className="logo-icon">S</span>
          <span>Savorly</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/recipes">Explore</Link>
          <Link to="/recipes">Categories</Link>
          {isAuthenticated && <Link to="/add-recipe">Add recipe</Link>}
        </nav>

        <div className="nav-actions">

          <Link className="icon-btn" to="/favorites" aria-label="Saved recipes">
            <Heart size={20} />
          </Link>

          {isAuthenticated ? <>
            <Link to="/add-recipe" className="icon-btn" aria-label="Add recipe"><Plus size={20} /></Link>
            <span className="profile-btn"><UserRound size={18} /><span>{user?.name || "Account"}</span></span>
            <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Sign out"><LogOut size={20} /></button>
          </> : <Link to="/login" className="profile-btn"><UserRound size={18} /><span>Sign in</span></Link>}

          <button
            className="mobile-menu"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;
