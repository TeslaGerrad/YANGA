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

// Mock ride history data (Zambian locations - Lusaka)
const MOCK_RIDE_HISTORY: Ride[] = [
  {
    id: '1',
    pickup: {
      latitude: -15.4167,
      longitude: 28.2833,
      address: 'Cairo Road, Lusaka City Centre, Lusaka',
    },
    destination: {
      latitude: -15.3875,
      longitude: 28.3228,
      address: 'Manda Hill Shopping Mall, Great East Road, Lusaka',
    },
    vehicleType: VEHICLE_TYPES[0],
    fare: 85.50,
    distance: 5.2,
    duration: '12 min',
    status: 'completed',
    driver: {
      id: 'd1',
      name: 'Chanda Mwale',
      rating: 4.9,
      vehicleType: 'Standard',
      vehicleNumber: 'BAZ 4521',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: '2',
    pickup: {
      latitude: -15.4086,
      longitude: 28.2809,
      address: 'Levy Junction Mall, Lusaka',
    },
    destination: {
      latitude: -15.3928,
      longitude: 28.3147,
      address: 'University of Zambia (UNZA), Great East Road, Lusaka',
    },
    vehicleType: VEHICLE_TYPES[1],
    fare: 145.80,
    distance: 8.5,
    duration: '18 min',
    status: 'completed',
    driver: {
      id: 'd2',
      name: 'Mutale Banda',
      rating: 4.8,
      vehicleType: 'Premium',
      vehicleNumber: 'ABB 7823',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '3',
    pickup: {
      latitude: -15.4253,
      longitude: 28.2831,
      address: 'Arcades Shopping Centre, Great East Road, Lusaka',
    },
    destination: {
      latitude: -15.3978,
      longitude: 28.3453,
      address: 'Crossroads Mall, Great East Road, Lusaka',
    },
    vehicleType: VEHICLE_TYPES[0],
    fare: 68.40,
    distance: 4.1,
    duration: '10 min',
    status: 'cancelled',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: '4',
    pickup: {
      latitude: -15.4471,
      longitude: 28.2664,
      address: 'Kenneth Kaunda International Airport, Lusaka',
    },
    destination: {
      latitude: -15.4167,
      longitude: 28.2833,
      address: 'InterContinental Hotel, Haile Selassie Avenue, Lusaka',
    },
    vehicleType: VEHICLE_TYPES[2],
    fare: 210.50,
    distance: 12.3,
    duration: '25 min',
    status: 'completed',
    driver: {
      id: 'd3',
      name: 'Joseph Phiri',
      rating: 4.95,
      vehicleType: 'XL',
      vehicleNumber: 'BAA 1234',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: '5',
    pickup: {
      latitude: -15.4203,
      longitude: 28.3102,
      address: 'Soweto Market, Lusaka',
    },
    destination: {
      latitude: -15.4389,
      longitude: 28.2756,
      address: 'East Park Mall, Great East Road, Lusaka',
    },
    vehicleType: VEHICLE_TYPES[1],
    fare: 128.70,
    distance: 7.2,
    duration: '15 min',
    status: 'completed',
    driver: {
      id: 'd4',
      name: 'Grace Mulenga',
      rating: 4.7,
      vehicleType: 'Premium',
      vehicleNumber: 'ABF 5678',
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  },
];

export const useRideStore = create<RideState>((set, get) => ({
  currentRide: null,
  pickup: null,
  destination: null,
  selectedVehicle: null,
  estimatedFare: null,
  rideHistory: MOCK_RIDE_HISTORY,
  
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
