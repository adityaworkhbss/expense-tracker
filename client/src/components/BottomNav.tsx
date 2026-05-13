import { NavLink } from 'react-router-dom';
import { Home, ListOrdered, PiggyBank, LayoutGrid } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Dashboard</span>
      </NavLink>
      
      <NavLink 
        to="/transactions" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <ListOrdered size={24} />
        <span>Transactions</span>
      </NavLink>

      <NavLink 
        to="/emis" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <PiggyBank size={24} />
        <span>Obligations</span>
      </NavLink>

      <NavLink 
        to="/more" 
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutGrid size={24} />
        <span>Manage</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
