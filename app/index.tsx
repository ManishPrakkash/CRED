import AdvisorDashboard from '@/components/dashboards/AdvisorDashboard';
import RepresentativeDashboard from '@/components/dashboards/RepresentativeDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

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
    case 'representative':
      return <RepresentativeDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-gray-600">Invalid role</Text>
        </View>
      );
  }
}