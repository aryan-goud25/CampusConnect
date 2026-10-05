import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Menu, X } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeMenu();
    navigate("/login");
    window.location.reload();
  };

  const linkClass =
    "font-medium text-gray-700 hover:text-blue-600 transition-colors";

  const mobileLinkClass =
    "block w-full rounded-lg px-3 py-3 text-left font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600";

  return (
    <nav className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <CalendarDays className="h-7 w-7 shrink-0 text-blue-600 sm:h-8 sm:w-8" />
          <span className="text-xl font-bold text-gray-900 sm:text-2xl">
            Campus<span className="text-blue-600">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 md:flex lg:gap-6">
          <Link to="/" className={linkClass}>
            Home
          </Link>

          <Link to="/events" className={linkClass}>
            Explore Events
          </Link>

          {/* Student Links */}
          {user?.role === "student" && (
            <>
              <Link to="/interests" className={linkClass}>
                My Interests
              </Link>

              <Link to="/my-registrations" className={linkClass}>
                My Registrations
              </Link>

              <Link to="/my-bookmarks" className={linkClass}>
                My Bookmarks
              </Link>
            </>
          )}

          {/* Organizer/Admin Links */}
          {user &&
            (user.role === "organizer" || user.role === "admin") && (
              <>
                <Link to="/create-event" className={linkClass}>
                  Create Event
                </Link>

                <Link to="/analytics" className={linkClass}>
                  Analytics
                </Link>

                <Link
                  to="/organizer-scanner"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  QR Scanner
                </Link>
              </>
            )}

          {/* Admin Links */}
          {user?.role === "admin" && (
            <Link
              to="/admin-dashboard"
              className="font-semibold text-purple-700 transition-colors hover:text-purple-900"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Authentication */}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="rounded-lg border border-blue-600 px-5 py-2 font-semibold text-blue-600 hover:bg-blue-50"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t bg-white px-4 py-3 shadow-md md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/" onClick={closeMenu} className={mobileLinkClass}>
              Home
            </Link>

            <Link
              to="/events"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Explore Events
            </Link>

            {/* Student Links */}
            {user?.role === "student" && (
              <>
                <Link
                  to="/interests"
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  My Interests
                </Link>

                <Link
                  to="/my-registrations"
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  My Registrations
                </Link>

                <Link
                  to="/my-bookmarks"
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  My Bookmarks
                </Link>
              </>
            )}

            {/* Organizer/Admin Links */}
            {user &&
              (user.role === "organizer" || user.role === "admin") && (
                <>
                  <Link
                    to="/create-event"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    Create Event
                  </Link>

                  <Link
                    to="/analytics"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    Analytics
                  </Link>

                  <Link
                    to="/organizer-scanner"
                    onClick={closeMenu}
                    className={mobileLinkClass}
                  >
                    QR Scanner
                  </Link>
                </>
              )}

            {/* Admin Links */}
            {user?.role === "admin" && (
              <Link
                to="/admin-dashboard"
                onClick={closeMenu}
                className={mobileLinkClass}
              >
                Admin Dashboard
              </Link>
            )}

            {/* Authentication */}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      closeMenu();
                      navigate("/login");
                    }}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => {
                      closeMenu();
                      navigate("/signup");
                    }}
                    className="w-full rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;