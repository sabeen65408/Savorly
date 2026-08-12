import { Heart, LogOut, Menu, Plus, UserRound, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link className="logo" to="/" onClick={closeMobileMenu}>
          <span className="logo-icon">S</span>
          <span>Savorly</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
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
            type="button"
            className="mobile-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </div>

      {isMobileMenuOpen && (
        <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <Link to="/recipes" onClick={closeMobileMenu}>Explore recipes</Link>
          <Link to="/recipes" onClick={closeMobileMenu}>Categories</Link>
          {isAuthenticated && <Link to="/favorites" onClick={closeMobileMenu}>Saved recipes</Link>}
          {isAuthenticated && <Link to="/add-recipe" onClick={closeMobileMenu}>Add a recipe</Link>}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout}>Sign out {user?.name ? `(${user.name})` : ""}</button>
          ) : (
            <Link to="/login" state={{ from: location.pathname }} onClick={closeMobileMenu}>Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
