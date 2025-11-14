import AdvisorDashboard from '@/components/dashboards/AdvisorDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, isLoading, hasJoinedClasses } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Always redirect staff to join class screen where they can select their class
    if (user?.role === 'staff' && !user?.currentClassId) {
      router.replace('/joinClass');
    }
  }, [user]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Please log in</Text>
      </View>
    );
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'advisor':
      return <AdvisorDashboard />;
    case 'staff':
      // Show staff dashboard only if they have selected a class
      if (!user.currentClassId) {
        return (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text className="text-gray-600 mt-4">Redirecting to select class...</Text>
          </View>
        );
      }
      return <StudentDashboard />;
    default:
      return (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-gray-600">Invalid role</Text>
        </View>
      );
  }
}