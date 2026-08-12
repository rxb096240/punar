import { NavLink } from 'react-router-dom';

export function Tabs() {
  return (
    <nav className="tabs">
      <NavLink to="/recurring" className={({ isActive }) => (isActive ? 'active' : '')}>
        Recurring
      </NavLink>
      <NavLink to="/bills" className={({ isActive }) => (isActive ? 'active' : '')}>
        Bills
      </NavLink>
      <NavLink to="/todos" className={({ isActive }) => (isActive ? 'active' : '')}>
        To-dos
      </NavLink>
    </nav>
  );
}
