import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Building, MapPin, DollarSign, Shield } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen ">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center h-[600px]" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Rental Home
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Connect with trusted landlords and discover properties that match your lifestyle and budget.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    placeholder="City, neighborhood, or address"
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="md:w-1/4">
                <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  id="property-type"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
              
              <div className="md:w-1/4">
                <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <select
                  id="price-range"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="0-1000">$0 - $1,000</option>
                  <option value="1000-2000">$1,000 - $2,000</option>
                  <option value="2000-3000">$2,000 - $3,000</option>
                  <option value="3000+">$3,000+</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Link
                  to="/properties"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md flex items-center justify-center"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#C9C7BA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#29292B] mb-4">Why Choose RentEase?</h2>
            <p className="text-lg text-[#29292B] max-w-3xl mx-auto">
              We make the rental process simple and stress-free for both landlords and tenants.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#29292B]">Easy Property Search</h3>
              <p className="text-[#29292B]">
                Find properties that match your exact requirements with our advanced search filters.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl text-[#29292B] font-semibold mb-2">Verified Listings</h3>
              <p className="text-[#29292B]">
                All properties and landlords are verified to ensure safety and reliability.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl text-[#29292B] font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-[#29292B]">
                Transparent pricing with no surprise fees or charges for tenants or landlords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#C9C7BA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#29292B] mb-4">How It Works</h2>
            <p className="text-lg text-[#29292B] max-w-3xl mx-auto">
              Our simple process makes finding or listing a rental property quick and easy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-[#29292B] mb-6 flex items-center">
                <Home className="h-8 w-8 text-[#29292B] mr-2" />
                For Tenants
              </h3>
              <ol className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">1</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Create an account</h4>
                    <p className="text-[#29292B]">Sign up as a tenant to access all features and save your favorite properties.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">2</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Search for properties</h4>
                    <p className="text-[#29292B]">Use our advanced filters to find properties that match your requirements.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">3</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Book a viewing</h4>
                    <p className="text-[#29292B]">Contact landlords directly and schedule property viewings.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">4</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Secure your rental</h4>
                    <p className="text-[#29292B]">Submit your application and complete the booking process online.</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8">
                <Link to="/register" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
                  Register as a tenant
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[#29292B] mb-6 flex items-center">
                <Building className="h-8 w-8 text-[#29292B] mr-2" />
                For Landlords
              </h3>
              <ol className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">1</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Create an account</h4>
                    <p className="text-[#29292B]">Sign up as a landlord to list and manage your properties.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">2</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">List your property</h4>
                    <p className="text-[#29292B]">Add details, photos, and set your rental terms and conditions.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">3</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Receive inquiries</h4>
                    <p className="text-[#29292B]">Get notified when tenants are interested in your property.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4">4</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Manage bookings</h4>
                    <p className="text-[#29292B]">Review applications and approve tenants through our platform.</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8">
                <Link to="/register" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
                  Register as a landlord
                  <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Rental?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of happy tenants and landlords who use RentEase every day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/properties"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium text-lg"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="bg-blue-800 text-white hover:bg-blue-900 px-6 py-3 rounded-md font-medium text-lg"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;