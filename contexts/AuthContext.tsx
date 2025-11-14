import type { User, JoinedClass } from '@/lib/types';
import { mockLogin } from '@/services/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  joinClass: (joinCode: string) => Promise<void>;
  switchClass: (classId: string) => void;
  hasJoinedClasses: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = '@cred_user_session';
const USER_DATA_PREFIX = '@cred_user_data_';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from storage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Save user data whenever it changes
  useEffect(() => {
    if (user) {
      saveUserData(user);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (sessionData) {
        setUser(JSON.parse(sessionData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      // Save current session
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
      
      // Save persistent data (classes) for this user
      const persistentData = {
        id: userData.id,
        email: userData.email,
        joinedClasses: userData.joinedClasses || [],
        currentClassId: userData.currentClassId,
      };
      await AsyncStorage.setItem(
        `${USER_DATA_PREFIX}${userData.id}`,
        JSON.stringify(persistentData)
      );
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await mockLogin(email, password);
      
      // Load persistent data (joined classes) for this user
      const persistentDataKey = `${USER_DATA_PREFIX}${userData.id}`;
      const storedData = await AsyncStorage.getItem(persistentDataKey);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Restore joined classes but NOT currentClassId
        // Staff must select class each time they log in
        userData.joinedClasses = parsedData.joinedClasses || [];
        userData.currentClassId = null; // Force them to select a class
      }
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Only clear the current session, preserve user's joined classes
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
      setUser(null);
    }
  };

  const joinClass = async (joinCode: string) => {
    if (!user || user.role !== 'staff') {
      throw new Error('Only staff can join classes');
    }

    // Check if already joined this class
    const existingClass = user.joinedClasses?.find(c => c.joinCode === joinCode);
    if (existingClass) {
      // Just switch to this class
      switchClass(existingClass.id);
      throw new Error('You have already joined this class. Switched to it.');
    }

    // Create new class entry
    const newClass: JoinedClass = {
      id: `class-${Date.now()}`,
      name: `Class ${joinCode}`,
      joinCode: joinCode,
      joinedAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      joinedClasses: [...(user.joinedClasses || []), newClass],
      currentClassId: newClass.id,
    };

    setUser(updatedUser);
  };

  const switchClass = (classId: string) => {
    if (!user) return;
    
    setUser({
      ...user,
      currentClassId: classId,
    });
  };

  const hasJoinedClasses = !!(user?.joinedClasses && user.joinedClasses.length > 0);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, joinClass, switchClass, hasJoinedClasses }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
