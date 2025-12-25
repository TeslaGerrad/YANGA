export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Passenger {
  id: string;
  name: string;
  rating: number;
  phone: string;
}

export interface Ride {
  id: string;
  passenger: Passenger;
  pickup: Location;
  dropoff: Location;
  distance: number; // in km
  duration: number; // in minutes
  originalPrice: number;
  offeredPrice?: number;
  status: "pending" | "accepted" | "ongoing" | "completed" | "cancelled";
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalRides: number;
  vehicleModel: string;
  vehiclePlate: string;
  profileImage?: string;
}

export interface Earnings {
  rideId: string;
  amount: number;
  date: Date;
  commission: number;
  netEarning: number;
}

export interface EarningsSummary {
  total: number;
  today: number;
  thisMonth: number;
  thisYear: number;
  totalRides: number;
  todayRides: number;
  monthRides: number;
  yearRides: number;
}

export type EarningPeriod = "all" | "day" | "month" | "year";
