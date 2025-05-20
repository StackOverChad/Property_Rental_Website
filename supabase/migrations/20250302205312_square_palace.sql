/*
  # Property Rental System Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `first_name` (text)
      - `last_name` (text)
      - `avatar_url` (text, nullable)
      - `phone` (text, nullable)
      - `user_type` (text, either 'landlord' or 'tenant')
    
    - `properties`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `description` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip` (text)
      - `price` (numeric)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `square_feet` (integer)
      - `property_type` (text)
      - `available_from` (date)
      - `available_to` (date, nullable)
      - `is_available` (boolean)
      - `owner_id` (uuid, references profiles.id)
      - `images` (text array)
      - `amenities` (text array)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `property_id` (uuid, references properties.id)
      - `tenant_id` (uuid, references profiles.id)
      - `start_date` (date)
      - `end_date` (date)
      - `total_price` (numeric)
      - `status` (text, one of: 'pending', 'approved', 'rejected', 'cancelled')
      - `message` (text, nullable)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `property_id` (uuid, references properties.id)
      - `reviewer_id` (uuid, references profiles.id)
      - `rating` (integer)
      - `comment` (text)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and write their own data
    - Add policies for public access to property listings
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('landlord', 'tenant'))
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  price NUMERIC NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  square_feet INTEGER NOT NULL,
  property_type TEXT NOT NULL,
  available_from DATE NOT NULL,
  available_to DATE,
  is_available BOOLEAN DEFAULT true,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}'
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  property_id UUID NOT NULL REFERENCES properties(id),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message TEXT
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  property_id UUID NOT NULL REFERENCES properties(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Landlords can insert their own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'landlord'
    )
  );

CREATE POLICY "Landlords can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'landlord'
    )
  );

CREATE POLICY "Landlords can delete their own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'landlord'
    )
  );

-- Bookings policies
CREATE POLICY "Tenants can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = tenant_id OR 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_id AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can insert their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = tenant_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'tenant'
    )
  );

CREATE POLICY "Tenants can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = tenant_id AND 
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'tenant'
    )
  );

CREATE POLICY "Landlords can update bookings for their properties"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_id AND properties.owner_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'landlord'
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tenants can insert reviews for properties they've booked"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.property_id = property_id AND 
            bookings.tenant_id = auth.uid() AND 
            bookings.status = 'approved'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);