import { create } from 'zustand';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface VehicleType {
  id: string;
  name: string;
  icon: string;
  priceMultiplier: number;
  capacity: number;
  eta: string;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleType: string;
  vehicleNumber: string;
  photo?: string;
}

interface Ride {
  id: string;
  pickup: Location;
  destination: Location;
  vehicleType: VehicleType;
  fare: number;
  distance: number;
  duration: string;
  status: 'pending' | 'accepted' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  driver?: Driver;
  createdAt: Date;
}

interface RideState {
  currentRide: Ride | null;
  pickup: Location | null;
  destination: Location | null;
  selectedVehicle: VehicleType | null;
  estimatedFare: number | null;
  rideHistory: Ride[];
  
  setPickup: (location: Location) => void;
  setDestination: (location: Location) => void;
  setSelectedVehicle: (vehicle: VehicleType) => void;
  calculateFare: () => void;
  bookRide: () => Promise<void>;
  cancelRide: (reason: string) => Promise<void>;
  completeRide: () => void;
  clearBooking: () => void;
}

// Mock vehicle types
export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: 'car',
    priceMultiplier: 1,
    capacity: 4,
    eta: '2-5 min',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: 'car-sport',
    priceMultiplier: 1.5,
    capacity: 4,
    eta: '5-10 min',
  },
  {
    id: 'xl',
    name: 'XL',
    icon: 'bus',
    priceMultiplier: 1.8,
    capacity: 6,
    eta: '8-12 min',
  },
];

export const useRideStore = create<RideState>((set, get) => ({
  currentRide: null,
  pickup: null,
  destination: null,
  selectedVehicle: null,
  estimatedFare: null,
  rideHistory: [],
  
  setPickup: (location) => {
    set({ pickup: location });
    get().calculateFare();
  },
  
  setDestination: (location) => {
    set({ destination: location });
    get().calculateFare();
  },
  
  setSelectedVehicle: (vehicle) => {
    set({ selectedVehicle: vehicle });
    get().calculateFare();
  },
  
  calculateFare: () => {
    const { pickup, destination, selectedVehicle } = get();
    
    if (!pickup || !destination || !selectedVehicle) {
      set({ estimatedFare: null });
      return;
    }
    
    // Simple distance calculation (Haversine formula would be better)
    const R = 6371; // Earth's radius in km
    const dLat = (destination.latitude - pickup.latitude) * Math.PI / 180;
    const dLon = (destination.longitude - pickup.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(pickup.latitude * Math.PI / 180) *
              Math.cos(destination.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Base fare + distance fare
    const baseFare = 5;
    const perKmFare = 2;
    const fare = (baseFare + distance * perKmFare) * selectedVehicle.priceMultiplier;
    
    set({ estimatedFare: Math.round(fare * 100) / 100 });
  },
  
  bookRide: async () => {
    const { pickup, destination, selectedVehicle, estimatedFare } = get();
    
    if (!pickup || !destination || !selectedVehicle || !estimatedFare) {
      throw new Error('Missing booking information');
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const ride: Ride = {
      id: Date.now().toString(),
      pickup,
      destination,
      vehicleType: selectedVehicle,
      fare: estimatedFare,
      distance: 10.5, // Mock
      duration: '15 min',
      status: 'pending',
      createdAt: new Date(),
    };
    
    set({ currentRide: ride });
  },
  
  cancelRide: async (reason: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { currentRide } = get();
    if (currentRide) {
      set((state) => ({
        currentRide: null,
        rideHistory: [
          ...state.rideHistory,
          { ...currentRide, status: 'cancelled' },
        ],
      }));
    }
  },
  
  completeRide: () => {
    const { currentRide } = get();
    if (currentRide) {
      set((state) => ({
        currentRide: null,
        rideHistory: [
          ...state.rideHistory,
          { ...currentRide, status: 'completed' },
        ],
      }));
    }
  },
  
  clearBooking: () => {
    set({
      pickup: null,
      destination: null,
      selectedVehicle: null,
      estimatedFare: null,
    });
  },
}));
