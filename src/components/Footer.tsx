import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#29292B] text-[#C9C7BA]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">RentEase</span>
            </div>
            <p className="text-[#C9C7BA]">
              Find your perfect rental property with ease. We connect landlords and tenants for a seamless rental experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-white">Properties</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Landlords</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/add-property" className="text-[#C9C7BA] hover:text-white">List Property</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#C9C7BA] hover:text-white">Manage Listings</Link>
              </li>
              <li>
                <Link to="/bookings" className="text-[#C9C7BA] hover:text-white">Booking Requests</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-[#C9C7BA]">support@rentease.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-[#C9C7BA]">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Home className="h-5 w-5 mr-2 text-blue-400 mt-1" />
                <span className="text-[#C9C7BA]">
                  123 Property Street<br />
                  Real Estate City, RE 12345<br />
                  United States
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-[#C9C7BA]">
          <p>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;