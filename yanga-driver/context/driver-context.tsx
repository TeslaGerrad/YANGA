import {
  Driver,
  EarningPeriod,
  Earnings,
  EarningsSummary,
  Ride,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface DriverContextType {
  driver: Driver;
  updateDriver: (updates: Partial<Driver>) => void;
  rides: Ride[];
  pendingRides: Ride[];
  acceptedRides: Ride[];
  completedRides: Ride[];
  earnings: Earnings[];
  earningsSummary: EarningsSummary;
  acceptRide: (rideId: string, offeredPrice?: number) => void;
  dismissRide: (rideId: string) => void;
  counterOffer: (rideId: string, price: number) => void;
  completeRide: (rideId: string) => void;
  getEarningsByPeriod: (period: EarningPeriod) => number;
  getRidesByPeriod: (period: EarningPeriod) => number;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DRIVER: "@driver_data",
  RIDES: "@rides_data",
  EARNINGS: "@earnings_data",
};

// Mock data generator for demo purposes
const generateMockRides = (): Ride[] => {
  const mockRides: Ride[] = [
    {
      id: "1",
      passenger: {
        id: "p1",
        name: "John Smith",
        rating: 4.8,
        phone: "+1234567890",
      },
      pickup: {
        latitude: -1.2921,
        longitude: 36.8219,
        address: "123 Main St, Nairobi",
      },
      dropoff: {
        latitude: -1.2864,
        longitude: 36.8172,
        address: "456 Oak Ave, Nairobi",
      },
      distance: 5.2,
      duration: 15,
      originalPrice: 850,
      status: "pending",
      requestedAt: new Date(),
    },
    {
      id: "2",
      passenger: {
        id: "p2",
        name: "Sarah Johnson",
        rating: 4.9,
        phone: "+1234567891",
      },
      pickup: {
        latitude: -1.3,
        longitude: 36.81,
        address: "789 Elm Rd, Nairobi",
      },
      dropoff: {
        latitude: -1.27,
        longitude: 36.83,
        address: "321 Pine St, Nairobi",
      },
      distance: 8.5,
      duration: 25,
      originalPrice: 1200,
      status: "pending",
      requestedAt: new Date(Date.now() - 120000),
    },
  ];
  return mockRides;
};

export const DriverProvider = ({ children }: { children: ReactNode }) => {
  const [driver, setDriver] = useState<Driver>({
    id: "driver_1",
    name: "Mutale Phiri",
    email: "mutale.phiri@yanga.zm",
    phone: "+260955345678",
    rating: 4.7,
    totalRides: 342,
    vehicleModel: "Toyota Corolla 2020",
    vehiclePlate: "BAZ 4521",
  });

  const [rides, setRides] = useState<Ride[]>(generateMockRides());
  const [earnings, setEarnings] = useState<Earnings[]>([]);

  useEffect(() => {
    loadData();
    // Simulate real-time ride requests
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addNewRideRequest();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const driverData = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER);
      const ridesData = await AsyncStorage.getItem(STORAGE_KEYS.RIDES);
      const earningsData = await AsyncStorage.getItem(STORAGE_KEYS.EARNINGS);

      if (driverData) setDriver(JSON.parse(driverData));
      if (ridesData) setRides(JSON.parse(ridesData));
      if (earningsData) setEarnings(JSON.parse(earningsData));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const addNewRideRequest = () => {
    const zambianNames = [
      "Thandiwe Sakala",
      "Bwalya Mwape",
      "Chilufya Mulenga",
      "Kabwe Tembo",
      "Natasha Zulu",
      "Patrick Kasonde",
      "Musonda Chanda",
      "Mpho Banda",
    ];
    const locations = [
      "Arcades Shopping Mall",
      "Levy Junction",
      "Crossroads Mall",
      "Kabulonga",
      "Roma",
      "Chilenje",
      "Meanwood",
      "Northmead",
      "Independence Avenue",
      "Great East Road",
    ];

    const newRide: Ride = {
      id: `ride_${Date.now()}`,
      passenger: {
        id: `p_${Date.now()}`,
        name: zambianNames[Math.floor(Math.random() * zambianNames.length)],
        rating: 4.5 + Math.random() * 0.5,
        phone: `+26097${Math.floor(1000000 + Math.random() * 9000000)}`,
      },
      pickup: {
        latitude: -15.4167 + (Math.random() - 0.5) * 0.1,
        longitude: 28.2833 + (Math.random() - 0.5) * 0.1,
        address: `${
          locations[Math.floor(Math.random() * locations.length)]
        }, Lusaka`,
      },
      dropoff: {
        latitude: -15.4167 + (Math.random() - 0.5) * 0.1,
        longitude: 28.2833 + (Math.random() - 0.5) * 0.1,
        address: `${
          locations[Math.floor(Math.random() * locations.length)]
        }, Lusaka`,
      },
      distance: 3 + Math.random() * 10,
      duration: 10 + Math.floor(Math.random() * 30),
      originalPrice: 40 + Math.floor(Math.random() * 120),
      status: "pending",
      requestedAt: new Date(),
    };

    setRides((prev) => {
      const updated = [newRide, ...prev];
      saveData(STORAGE_KEYS.RIDES, updated);
      return updated;
    });
  };

  const updateDriver = (updates: Partial<Driver>) => {
    setDriver((prev) => {
      const updated = { ...prev, ...updates };
      saveData(STORAGE_KEYS.DRIVER, updated);
      return updated;
    });
  };

  const acceptRide = (rideId: string, offeredPrice?: number) => {
    setRides((prev) => {
      const updated = prev.map((ride) =>
        ride.id === rideId
          ? {
              ...ride,
              status: "accepted" as const,
              offeredPrice,
              acceptedAt: new Date(),
            }
          : ride
      );
      saveData(STORAGE_KEYS.RIDES, updated);
      return updated;
    });
  };

  const dismissRide = (rideId: string) => {
    setRides((prev) => {
      const updated = prev.filter((ride) => ride.id !== rideId);
      saveData(STORAGE_KEYS.RIDES, updated);
      return updated;
    });
  };

  const counterOffer = (rideId: string, price: number) => {
    setRides((prev) => {
      const updated = prev.map((ride) =>
        ride.id === rideId ? { ...ride, offeredPrice: price } : ride
      );
      saveData(STORAGE_KEYS.RIDES, updated);
      return updated;
    });
  };

  const completeRide = (rideId: string) => {
    const ride = rides.find((r) => r.id === rideId);
    if (!ride) return;

    const finalPrice = ride.offeredPrice || ride.originalPrice;
    const commission = finalPrice * 0.2; // 20% commission
    const netEarning = finalPrice - commission;

    const earning: Earnings = {
      rideId: ride.id,
      amount: finalPrice,
      date: new Date(),
      commission,
      netEarning,
    };

    setEarnings((prev) => {
      const updated = [...prev, earning];
      saveData(STORAGE_KEYS.EARNINGS, updated);
      return updated;
    });

    setRides((prev) => {
      const updated = prev.map((r) =>
        r.id === rideId
          ? { ...r, status: "completed" as const, completedAt: new Date() }
          : r
      );
      saveData(STORAGE_KEYS.RIDES, updated);
      return updated;
    });

    updateDriver({
      totalRides: driver.totalRides + 1,
    });
  };

  const pendingRides = rides.filter((r) => r.status === "pending");
  const acceptedRides = rides.filter((r) => r.status === "accepted");
  const completedRides = rides.filter((r) => r.status === "completed");

  const getEarningsByPeriod = (period: EarningPeriod): number => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return earnings
      .filter((e) => {
        const earningDate = new Date(e.date);
        switch (period) {
          case "day":
            return earningDate >= todayStart;
          case "month":
            return earningDate >= monthStart;
          case "year":
            return earningDate >= yearStart;
          default:
            return true;
        }
      })
      .reduce((sum, e) => sum + e.netEarning, 0);
  };

  const getRidesByPeriod = (period: EarningPeriod): number => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return completedRides.filter((r) => {
      const rideDate = r.completedAt ? new Date(r.completedAt) : new Date();
      switch (period) {
        case "day":
          return rideDate >= todayStart;
        case "month":
          return rideDate >= monthStart;
        case "year":
          return rideDate >= yearStart;
        default:
          return true;
      }
    }).length;
  };

  const earningsSummary: EarningsSummary = {
    total: getEarningsByPeriod("all"),
    today: getEarningsByPeriod("day"),
    thisMonth: getEarningsByPeriod("month"),
    thisYear: getEarningsByPeriod("year"),
    totalRides: completedRides.length,
    todayRides: getRidesByPeriod("day"),
    monthRides: getRidesByPeriod("month"),
    yearRides: getRidesByPeriod("year"),
  };

  return (
    <DriverContext.Provider
      value={{
        driver,
        updateDriver,
        rides,
        pendingRides,
        acceptedRides,
        completedRides,
        earnings,
        earningsSummary,
        acceptRide,
        dismissRide,
        counterOffer,
        completeRide,
        getEarningsByPeriod,
        getRidesByPeriod,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within DriverProvider");
  }
  return context;
};
