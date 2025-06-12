import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <NavLink to="/" className="dashboard-link">
        <h2 className='name'>Dashboard</h2>
      </NavLink>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Home
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Inventory
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Upload
        </NavLink>
        <NavLink to="/sales" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Sales
        </NavLink>
        <NavLink to="/tracking" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Tracking
        </NavLink>
        <NavLink to="/predict" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Predict Demand
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Help
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
