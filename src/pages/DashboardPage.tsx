import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { 
  Home, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Filter,
  MapPin,
  Search,
  Bed,
  Bath,
  Square
} from 'lucide-react';

type Property = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  is_available: boolean;
  images: string[];
  owner_id: string;
};

type Booking = {
  id: string;
  created_at: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  properties: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    images: string[];
  };
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    city: ''
  });
  
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      if (profile?.user_type === 'landlord') {
        await fetchProperties();
      } else {
        await fetchAllProperties();
        await fetchTenantBookings();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProperties = async () => {
    try {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      if (propertiesData && propertiesData.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            properties:property_id (*),
            profiles:tenant_id (*)
          `)
          .in('property_id', propertiesData.map(p => p.id))
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAllProperties = async () => {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }
      if (filters.minBedrooms) {
        query = query.gte('bedrooms', parseInt(filters.minBedrooms));
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const fetchTenantBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        properties:property_id (*),
        profiles:tenant_id (*)
      `)
      .eq('tenant_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setBookings(data || []);
  };
  
  const handleDeleteProperty = (id: string) => {
    setDeletePropertyId(id);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteProperty = async () => {
    if (!deletePropertyId) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deletePropertyId);
      
      if (error) throw error;
      
      setProperties(properties.filter(p => p.id !== deletePropertyId));
      setShowDeleteModal(false);
      setDeletePropertyId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.user_type === 'tenant') {
      fetchAllProperties();
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      city: ''
    });
    fetchAllProperties();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#C9C7BA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#29292B]">Dashboard</h1>
            <p className="text-[#29292B] mt-1">
              Welcome back, {profile?.first_name} {profile?.last_name}
            </p>
          </div>
          
          {profile?.user_type === 'landlord' && (
            <Link
              to="/add-property"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New Property
            </Link>
          )}
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-[#29292B] hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Home className="h-5 w-5 inline-block mr-2" />
              {profile?.user_type === 'landlord' ? 'My Properties' : 'Available Properties'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-[#29292B] hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Calendar className="h-5 w-5 inline-block mr-2" />
              {profile?.user_type === 'landlord' ? 'Booking Requests' : 'My Bookings'}
            </button>
          </nav>
        </div>
        
        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            {/* Filters for tenants */}
            {profile?.user_type === 'tenant' && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <form onSubmit={applyFilters} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                      </label>
                      <input
                        type="text"
                        id="search"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by title or address"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        placeholder="Enter city"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        id="minPrice"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min price"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        id="maxPrice"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max price"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="minBedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Min Bedrooms
                      </label>
                      <input
                        type="number"
                        id="minBedrooms"
                        name="minBedrooms"
                        value={filters.minBedrooms}
                        onChange={handleFilterChange}
                        placeholder="Min bedrooms"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear Filters
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </form>
              </div>
            )}

            {properties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                {profile?.user_type === 'landlord' ? (
                  <p className="text-gray-600 mb-4">You haven't listed any properties yet.</p>
                ) : (
                  <p className="text-gray-600 mb-4">No properties are available at the moment.</p>
                )}
                {profile?.user_type === 'landlord' && (
                  <Link
                    to="/add-property"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Your First Property
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="h-48 bg-gray-200 relative">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Home className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md font-medium">
                        ${property.price}/mo
                      </div>
                      {!property.is_available && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white px-3 py-2 text-center">
                          Not Available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {property.address}, {property.city}, {property.state}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
                        <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
                        <span>{property.square_feet} sq ft</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/properties/${property.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium text-center"
                        >
                          View
                        </Link>
                        {profile?.user_type === 'landlord' && property.owner_id === user?.id && (
                          <>
                            <Link
                              to={`/edit-property/${property.id}`}
                              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-md text-sm font-medium text-center"
                            >
                              <Edit className="h-4 w-4 inline-block mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-md text-sm font-medium"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                {profile?.user_type === 'landlord' ? (
                  <p className="text-gray-600">You don't have any booking requests yet.</p>
                ) : (
                  <p className="text-gray-600">You haven't made any bookings yet.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-md overflow-hidden mr-6 mb-4 md:mb-0">
                          {booking.properties.images && booking.properties.images.length > 0 ? (
                            <img
                              src={booking.properties.images[0]}
                              alt={booking.properties.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Home className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link to={`/properties/${booking.properties.id}`} className="hover:text-blue-600">
                                  {booking.properties.title}
                                </Link>
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {booking.properties.address}, {booking.properties.city}, {booking.properties.state}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0 md:ml-4 text-right">
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Booking Period</p>
                                <p className="text-sm font-medium">
                                  {format(new Date(booking.start_date), 'MMM d, yyyy')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">Total Price</p>
                                <p className="text-sm font-medium">${booking.total_price}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-5 w-5 text-gray-500 mr-2" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  {profile?.user_type === 'landlord' ? 'Tenant' : 'Booked on'}
                                </p>
                                <p className="text-sm font-medium">
                                  {profile?.user_type === 'landlord' 
                                    ? booking.profiles
                                      ? `${booking.profiles.first_name} ${booking.profiles.last_name}`
                                      : 'Unknown Tenant'
                                    : format(new Date(booking.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {profile?.user_type === 'landlord' && booking.status === 'pending' && (
                            <div className="mt-4 flex space-x-4">
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'approved')}
                                className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded-md text-sm font-medium"
                              >
                                <CheckCircle className="h-4 w-4 inline-block mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-md text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4 inline-block mr-1" />
                                Reject
                              </button>
                            </div>
                          )}
                          
                          {profile?.user_type === 'tenant' && booking.status === 'pending' && (
                            <div className="mt-4">
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium"
                              >
                                <XCircle className="h-4 w-4 inline-block mr-1" />
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Delete Property Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProperty}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;