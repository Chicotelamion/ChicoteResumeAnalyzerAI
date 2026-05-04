import { BriefcaseBusiness, FileText, History, Home, LayoutDashboard, LogOut, Menu, Sparkles, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Profile', icon: FileText },
  { to: '/analyze', label: 'Guidance', icon: Sparkles },
  { to: '/history', label: 'History', icon: History }
];

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-marine text-white' : 'text-slate-600 hover:bg-slate-100'
        }`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  const links = currentUser ? privateLinks : [{ to: '/', label: 'Home', icon: Home }];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-marine text-white">
            <BriefcaseBusiness size={21} />
          </span>
          <span>CareerPath AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <>
              <span className="max-w-44 truncate text-sm font-medium text-slate-600">
                {currentUser.displayName || currentUser.email}
              </span>
              <button className="btn-secondary" onClick={handleLogout}>
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn-secondary" to="/login">
                Login
              </Link>
              <Link className="btn-primary" to="/register">
                <UserPlus size={17} />
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="btn-secondary px-3 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavItem key={link.to} {...link} onClick={() => setOpen(false)} />
            ))}
            {currentUser ? (
              <button className="btn-secondary mt-2" onClick={handleLogout}>
                <LogOut size={17} />
                Logout
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link className="btn-secondary" to="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link className="btn-primary" to="/register" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
