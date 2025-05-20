import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, isWithinInterval, parseISO, addDays, differenceInDays } from 'date-fns';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  DollarSign, 
  Home, 
  CheckCircle, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  User,
  Info
} from 'lucide-react';

type Property = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  available_from: string;
  available_to: string | null;
  is_available: boolean;
  owner_id: string;
  images: string[];
  amenities: string[];
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
};

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [existingBookings, setExistingBookings] = useState<{
    start_date: string;
    end_date: string;
    status: string;
  }[]>([]);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchReviews();
      fetchExistingBookings();
    }
  }, [id]);
  
  useEffect(() => {
    if (startDate && endDate && property) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = differenceInDays(end, start);
      if (days > 0) {
        setTotalPrice(days * property.price);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, property]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProperty(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:reviewer_id (
            first_name,
            last_name
          )
        `)
        .eq('property_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchExistingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date, status')
        .eq('property_id', id)
        .in('status', ['approved', 'pending'])
        .order('start_date', { ascending: true });

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const isDateRangeAvailable = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    return !existingBookings.some(booking => {
      const bookingStart = parseISO(booking.start_date);
      const bookingEnd = parseISO(booking.end_date);

      return (
        isWithinInterval(startDate, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(endDate, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(bookingStart, { start: startDate, end: endDate })
      );
    });
  };

  const getNextAvailableDate = () => {
    if (existingBookings.length === 0) return null;
    
    const lastBooking = existingBookings[existingBookings.length - 1];
    return format(parseISO(lastBooking.end_date), 'MMMM d, yyyy');
  };
  
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    
    if (!user || !profile) {
      navigate('/login');
      return;
    }
    
    if (profile.user_type !== 'tenant') {
      setBookingError('Only tenants can book properties');
      return;
    }
    
    if (!startDate || !endDate) {
      setBookingError('Please select both start and end dates');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      setBookingError('End date must be after start date');
      return;
    }

    if (!isDateRangeAvailable(startDate, endDate)) {
      setBookingError('These dates are not available. Please select different dates.');
      return;
    }
    
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          property_id: id,
          tenant_id: user.id,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
          message: message,
        },
      ]);
      
      if (error) throw error;
      
      setBookingSuccess(true);
      setStartDate('');
      setEndDate('');
      setMessage('');
      fetchExistingBookings();
    } catch (err: any) {
      setBookingError(err.message);
    }
  };
  
  const nextImage = () => {
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const prevImage = () => {
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error || 'Property not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="relative bg-gray-900 h-96">
        {property.images && property.images.length > 0 ? (
          <>
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? 'bg-[#C9C7BA]' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Home className="h-24 w-24 text-gray-400" />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#C9C7BA] rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <p className="text-gray-600 flex items-center mb-4">
                    <MapPin className="h-5 w-5 mr-1 text-gray-500" />
                    {property.address}, {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">${property.price}<span className="text-lg font-normal text-gray-600">/mo</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-t border-b border-gray-200 my-4">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-lg font-medium">{property.bedrooms}</p>
                    <p className="text-sm text-gray-500">{property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-lg font-medium">{property.bathrooms}</p>
                    <p className="text-sm text-gray-500">{property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-lg font-medium">{property.square_feet}</p>
                    <p className="text-sm text-gray-500">Sq Ft</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-gray-500" />
                  <div>
                    <p className="text-lg font-medium">{property.property_type}</p>
                    <p className="text-sm text-gray-500">Property Type</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-3">Availability</h2>
                <p className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  Available from {format(new Date(property.available_from), 'MMMM d, yyyy')}
                  {property.available_to && ` to ${format(new Date(property.available_to), 'MMMM d, yyyy')}`}
                </p>
              </div>
            </div>

            <div className="bg-[#C9C7BA] rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet for this property.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                          {review.profiles.first_name} {review.profiles.last_name}
                        </span>
                        <span className="ml-auto text-sm text-gray-500">
                          {format(new Date(review.created_at), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#C9C7BA] rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Landlord</h2>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  {property.profiles?.avatar_url ? (
                    <img
                      src={property.profiles.avatar_url}
                      alt={`${property.profiles?.first_name} ${property.profiles?.last_name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {property.profiles?.first_name} {property.profiles?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>
            </div>

            {profile?.user_type === 'tenant' && (
              <div className="bg-[#C9C7BA] rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Book This Property</h2>
                
                {existingBookings.length > 0 && (
                  <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Current Bookings:</p>
                        <ul className="mt-2 space-y-1">
                          {existingBookings.map((booking, index) => (
                            <li key={index} className="text-sm text-blue-600">
                              {format(parseISO(booking.start_date), 'MMM d, yyyy')} - {format(parseISO(booking.end_date), 'MMM d, yyyy')}
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100">
                                {booking.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {getNextAvailableDate() && (
                          <p className="mt-2 text-sm text-blue-700">
                            Next available date: {getNextAvailableDate()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {bookingSuccess ? (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-700">
                        Booking request sent successfully! The landlord will review your request.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit}>
                    {bookingError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <p className="text-red-700">{bookingError}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Move-in Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          min={property.available_from}
                          max={property.available_to || undefined}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Move-out Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          min={startDate || property.available_from}
                          max={property.available_to || undefined}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message to Landlord (Optional)
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Introduce yourself and explain why you're interested in this property..."
                        />
                      </div>
                      
                      {totalPrice > 0 && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Total Price:</span>
                            <span className="text-lg font-semibold text-blue-600">${totalPrice}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Based on ${property.price} per month for the selected period
                          </p>
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Request to Book
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;