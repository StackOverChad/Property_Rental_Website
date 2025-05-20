import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { 
  Home, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Filter,
  ChevronDown
} from 'lucide-react';

type Booking = {
  id: string;
  created_at: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  message: string | null;
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

const BookingsPage = () => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);
  
  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, sortBy]);
  
  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          properties:property_id (*),
          profiles:tenant_id (*)
        `);
      
      if (profile?.user_type === 'landlord') {
        // For landlords, get bookings for their properties
        const { data: properties } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user?.id);
        
        if (properties && properties.length > 0) {
          query = query.in('property_id', properties.map(p => p.id));
        } else {
          setBookings([]);
          setLoading(false);
          return;
        }
      } else {
        // For tenants, get their bookings
        query = query.eq('tenant_id', user?.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.total_price - a.total_price);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.total_price - b.total_price);
    } else if (sortBy === 'start-date') {
      result.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }
    
    setFilteredBookings(result);
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
            <h1 className="text-3xl font-bold text-[#29292B]">
              {profile?.user_type === 'landlord' ? 'Booking Requests' : 'My Bookings'}
            </h1>
            <p className="text-[#29292B] mt-1">
              {profile?.user_type === 'landlord' 
                ? 'Manage booking requests for your properties' 
                : 'View and manage your property bookings'}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="start-date">Start Date</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' 
                ? `You don't have any ${statusFilter} bookings.` 
                : 'You don\'t have any bookings yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
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
                      
                      {booking.message && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-700">{booking.message}</p>
                        </div>
                      )}
                      
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
    </div>
  );
};

export default BookingsPage;