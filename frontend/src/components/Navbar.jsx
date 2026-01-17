import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
          >
            JobPortal
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.userType === 'job_seeker' && (
                   <>
                     <button
                       onClick={() => navigate('/jobs')}
                       className="text-gray-600 hover:text-gray-900 font-medium"
                     >
                       Browse Jobs
                     </button>
                     <button
                       onClick={() => navigate('/saved-jobs')}
                       className="text-gray-600 hover:text-gray-900 font-medium"
                     >
                       Saved Jobs
                     </button>
                     <button
                       onClick={() => navigate('/applications')}
                       className="text-gray-600 hover:text-gray-900 font-medium"
                     >
                       My Applications
                     </button>
                     <button
                       onClick={() => navigate('/resume-builder')}
                       className="text-gray-600 hover:text-gray-900 font-medium"
                     >
                       Resume Builder
                     </button>
                   </>
                 )}

                {user?.userType === 'employer' && (
                  <>
                    <button
                      onClick={() => navigate('/employer/jobs')}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/employer/post-job')}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Post Job
                    </button>
                  </>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
                  <span className="text-gray-600">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.userType === 'job_seeker' && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/jobs');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Browse Jobs
                    </button>
                    <button
                      onClick={() => {
                        navigate('/saved-jobs');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Saved Jobs
                    </button>
                    <button
                      onClick={() => {
                        navigate('/applications');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      My Applications
                    </button>
                  </>
                )}

                {user?.userType === 'employer' && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/employer/jobs');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/employer/post-job');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      Post Job
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 border-t border-gray-200 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
