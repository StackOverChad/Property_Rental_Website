import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Menu, X, LogOut, User, PlusCircle, Calendar, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-[#29292B] text-[#C9C7BA] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Home className="h-8 w-8 text-[#F66435]" />
              <span className="ml-2 text-xl font-bold ">RentEase</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent font-bold hover:font-bold hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/properties"
                className="border-transparent font-bold hover:font-bold hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Properties
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {profile?.user_type === 'landlord' && (
                  <Link
                    to="/add-property"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Property
                  </Link>
                )}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/dashboard"
                      className="text-[#C9C7BA] hover:text-blue-500"
                    >
                      <LayoutDashboard className="h-6 w-6" />
                    </Link>
                    <Link
                      to="/bookings"
                      className="text-[#C9C7BA] hover:text-blue-500"
                    >
                      <Calendar className="h-6 w-6" />
                    </Link>
                    <Link
                      to="/profile"
                      className="text-[#C9C7BA] hover:text-blue-500"
                    >
                      <User className="h-6 w-6" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-[#C9C7BA] hover:text-blue-500"
                    >
                      <LogOut className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="font-bold hover:font-bold hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 text-[#C9C7BA]">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500"
              onClick={toggleMenu}
            >
              Properties
            </Link>
          </div>
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {profile?.first_name} {profile?.last_name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {profile?.user_type}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-[#C9C7BA] hover:text-blue-500 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                {profile?.user_type === 'landlord' && (
                  <Link
                    to="/add-property"
                    className="block px-4 py-2 text-base font-medium text-[#C9C7BA] hover:text-blue-500 hover:bg-gray-100"
                    onClick={toggleMenu}
                  >
                    Add Property
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className="block px-4 py-2 text-base font-medium text-[#C9C7BA] hover:text-blue-500 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Bookings
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-[#C9C7BA] hover:text-blue-500 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-[#C9C7BA] hover:text-blue-500 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;