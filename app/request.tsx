import AdvisorRequest from '@/components/requests/AdvisorRequest';
import RepresentativeRequest from '@/components/requests/RepresentativeRequest';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function RequestManagementScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
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

  // Route to role-specific request component
  if (user.role === 'advisor') {
    return <AdvisorRequest />;
  } else if (user.role === 'representative') {
    return <RepresentativeRequest />;
  }

  // Students don't have access to request management
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-gray-600">Access restricted to representatives and advisors</Text>
    </View>
  );
}