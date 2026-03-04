import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/final logo.svg';

const UserFooter = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Column 1: Logo */}
        <div className="footer-col logo-col">
          <Link to="/" className="footer-logo-link">
            <img src={logo} alt="Charity Typing" className="footer-logo" />
          </Link>
        </div>

        {/* Column 2: Pages */}
        <div className="footer-col">
          <h4 className="footer-heading">Pages</h4>
          <Link to="/dashboard" className="footer-link">
            Dashboard
          </Link>
          <Link to="/practice" className="footer-link">
            Practice
          </Link>
          <Link to="/" className="footer-link">
            Home
          </Link>
        </div>

        {/* Column 3: Practice */}
        <div className="footer-col">
          <h4 className="footer-heading">Practice</h4>
          <Link to="/practice" state={{ level: 'Home Row' }} className="footer-link">
            Fast Touch Typing Course
          </Link>
          <Link to="/practice" state={{ level: 'Numeric' }} className="footer-link">
            Advanced Keys & Symbols Masterclass
          </Link>
          <Link to="/practice" state={{ level: 'Full Keyboard' }} className="footer-link">
            Typing Test
          </Link>
        </div>

        {/* Column 4: Contest */}
        <div className="footer-col">
          <h4 className="footer-heading">Contest</h4>
          <Link to="/" state={{ contestTab: 'All', scrollToContests: true }} className="footer-link">
            All Contests
          </Link>
          <Link to="/" state={{ contestTab: 'Upcoming', scrollToContests: true }} className="footer-link">
            Upcoming Contests
          </Link>
          <Link to="/" state={{ contestTab: 'Live', scrollToContests: true }} className="footer-link">
            Live Contests
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
