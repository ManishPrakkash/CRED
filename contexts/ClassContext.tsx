import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Class, CreateClassParams, JoinedClass } from '@/lib/types';
import {
  createClass as createClassService,
  getAdvisorClasses,
  joinClassByCode as joinClassService,
  getStaffClasses,
  deleteClass as deleteClassService,
  getClassById as getClassByIdService,
} from '@/services/supabaseClasses';
import { useAuth } from './AuthContext';

interface ClassContextType {
  classes: Class[];
  loading: boolean;
  createClass: (params: CreateClassParams) => Promise<{ success: boolean; class?: Class; message: string }>;
  deleteClass: (classId: string) => Promise<{ success: boolean; message: string }>;
  joinClassByCode: (classCode: string) => Promise<{ success: boolean; class?: Class; message: string }>;
  getClassById: (classId: string) => Promise<Class | null>;
  refreshClasses: () => Promise<void>;
  getTotalStats: () => { totalClasses: number; totalStaff: number; avgStaffPerClass: number };
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load classes when user changes
  useEffect(() => {
    if (user) {
      refreshClasses();
    } else {
      setClasses([]);
    }
  }, [user]);

  const refreshClasses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (user.role === 'advisor') {
        // Load advisor's classes
        const advisorClasses = await getAdvisorClasses(user.id);
        setClasses(advisorClasses);
      } else if (user.role === 'staff') {
        // Load staff's joined classes (just the metadata from joined_classes JSONB)
        const joinedClasses = await getStaffClasses(user.id);
        // For staff, we can store joined classes differently or fetch full class data
        // For now, we'll keep classes empty for staff - they manage via joined_classes
        setClasses([]);
      }
    } catch (error: any) {
      console.error('Failed to load classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (params: CreateClassParams): Promise<{ success: boolean; class?: Class; message: string }> => {
    if (!user || user.role !== 'advisor') {
      return {
        success: false,
        message: 'Only advisors can create classes',
      };
    }

    try {
      const newClass = await createClassService(user.id, params);
      setClasses(prev => [newClass, ...prev]);
      return {
        success: true,
        class: newClass,
        message: 'Class created successfully',
      };
    } catch (error: any) {
      console.error('Create class error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create class',
      };
    }
  };

  const deleteClass = async (classId: string): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'advisor') {
      return {
        success: false,
        message: 'Only advisors can delete classes',
      };
    }

    try {
      const result = await deleteClassService(classId, user.id);
      if (result.success) {
        setClasses(prev => prev.filter(cls => cls.id !== classId));
      }
      return result;
    } catch (error: any) {
      console.error('Delete class error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete class',
      };
    }
  };

  const joinClassByCode = async (classCode: string): Promise<{ success: boolean; class?: Class; message: string }> => {
    if (!user || user.role !== 'staff') {
      return {
        success: false,
        message: 'Only staff can join classes',
      };
    }

    try {
      const result = await joinClassService(user.id, classCode);
      return result;
    } catch (error: any) {
      console.error('Join class error:', error);
      return {
        success: false,
        message: error.message || 'Failed to join class',
      };
    }
  };

  const getClassById = async (classId: string): Promise<Class | null> => {
    try {
      return await getClassByIdService(classId);
    } catch (error) {
      console.error('Get class by ID error:', error);
      return null;
    }
  };

  const getTotalStats = () => {
    const totalClasses = classes.length;
    const totalStaff = classes.reduce((sum, cls) => sum + (cls.current_enrollment || 0), 0);
    const avgStaffPerClass = totalClasses > 0 ? Math.round(totalStaff / totalClasses) : 0;

    return { totalClasses, totalStaff, avgStaffPerClass };
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        loading,
        createClass,
        deleteClass,
        joinClassByCode,
        getClassById,
        refreshClasses,
        getTotalStats,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
}
