import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  avatar?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tempPhone: string | null;
  verificationCode: string | null;
  
  login: (phone: string, password: string) => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<string>;
  verifyCode: (phone: string, code: string) => Promise<boolean>;
  completeRegistration: (phone: string, password: string, name?: string, email?: string) => Promise<void>;
  setupProfile: (userData: { name?: string; username?: string; email?: string }) => void;
  requestPasswordReset: (phone: string) => Promise<string>;
  resetPassword: (phone: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  tempPhone: null,
  verificationCode: null,
  
  login: async (phone: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const user: User = {
        id: '1',
        name: 'Namy Mubila',
        phone,
        email: 'namy@example.com',
        username: 'namymubila',
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  sendVerificationCode: async (phone: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call to send SMS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      set({ tempPhone: phone, verificationCode: code, isLoading: false });
      
      // In production, this would be sent via SMS
      console.log('Verification code:', code);
      return code;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  verifyCode: async (phone: string, code: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedCode = get().verificationCode;
      const isValid = code === storedCode;
      
      set({ isLoading: false });
      return isValid;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  completeRegistration: async (phone: string, password: string, name?: string, email?: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Date.now().toString(),
        phone,
        name,
        email,
      };
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        tempPhone: null,
        verificationCode: null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  setupProfile: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },
  
  requestPasswordReset: async (phone: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      set({ tempPhone: phone, verificationCode: code, isLoading: false });
      
      console.log('Password reset code:', code);
      return code;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  resetPassword: async (phone: string, code: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedCode = get().verificationCode;
      if (code !== storedCode) {
        throw new Error('Invalid verification code');
      }
      
      set({ 
        isLoading: false,
        tempPhone: null,
        verificationCode: null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  
  updateProfile: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },
}));
