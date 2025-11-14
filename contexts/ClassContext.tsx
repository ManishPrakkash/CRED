import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credPoints?: number;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  joinCode: string;
  students: Student[];
  createdAt: string;
}

export interface PendingRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  classId: string;
  requestedAt: string;
}

interface ClassContextType {
  classes: Class[];
  pendingRequests: PendingRequest[];
  createClass: (name: string, code?: string) => Class;
  deleteClass: (classId: string) => void;
  addStudentToClass: (classId: string, student: Student) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
  approvePendingRequest: (requestId: string, classId: string) => void;
  rejectPendingRequest: (requestId: string) => void;
  getClassById: (classId: string) => Class | undefined;
  getTotalStats: () => { totalClasses: number; totalStudents: number; avgStudentsPerClass: number };
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const generateJoinCode = (name: string): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const sanitizedName = name.replace(/\s+/g, '-').toUpperCase().substring(0, 8);
    return `${sanitizedName}-${year}-${random}`;
  };

  const createClass = (name: string, code?: string): Class => {
    const newClass: Class = {
      id: `class_${Date.now()}`,
      name: name.trim(),
      code: code?.trim() || `CLASS-${classes.length + 1}`,
      studentCount: 0,
      joinCode: generateJoinCode(name),
      students: [],
      createdAt: new Date().toISOString(),
    };

    setClasses(prev => [newClass, ...prev]);
    return newClass;
  };

  const deleteClass = (classId: string) => {
    setClasses(prev => prev.filter(cls => cls.id !== classId));
    // Also remove pending requests for this class
    setPendingRequests(prev => prev.filter(req => req.classId !== classId));
  };

  const addStudentToClass = (classId: string, student: Student) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        // Check if student already exists
        if (cls.students.some(s => s.id === student.id)) {
          return cls;
        }
        return {
          ...cls,
          students: [...cls.students, student],
          studentCount: cls.studentCount + 1,
        };
      }
      return cls;
    }));
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: cls.students.filter(s => s.id !== studentId),
          studentCount: Math.max(0, cls.studentCount - 1),
        };
      }
      return cls;
    }));
  };

  const approvePendingRequest = (requestId: string, classId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    // Add student to class
    const newStudent: Student = {
      id: requestId,
      name: request.studentName,
      email: request.studentEmail,
      avatar: request.avatar,
      credPoints: 0,
    };

    addStudentToClass(classId, newStudent);

    // Remove from pending requests
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const rejectPendingRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const getClassById = (classId: string): Class | undefined => {
    return classes.find(cls => cls.id === classId);
  };

  const getTotalStats = () => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
    const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

    return { totalClasses, totalStudents, avgStudentsPerClass };
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        pendingRequests,
        createClass,
        deleteClass,
        addStudentToClass,
        removeStudentFromClass,
        approvePendingRequest,
        rejectPendingRequest,
        getClassById,
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
