function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a className="logo" href="/">
            <span className="logo-icon">S</span>
            <span>Savorly</span>
          </a>

          <p>
            Discover, cook and share recipes that make every meal memorable.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Explore</h4>
            <a href="#">Recipes</a>
            <a href="#">Categories</a>
            <a href="#">Popular</a>
          </div>

          <div>
            <h4>Community</h4>
            <a href="#">Add Recipe</a>
            <a href="#">Favorites</a>
            <a href="#">Reviews</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Savorly. Made with ❤️ for food lovers.</span>
      </div>
    </footer>
  );
}

export default Footer;