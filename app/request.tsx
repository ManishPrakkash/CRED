import AdvisorRequest from '@/components/requests/AdvisorRequest';
import StaffRequest from '@/components/requests/RepresentativeRequest';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function RequestManagementScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect staff without active class to joinClass page
  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'staff' && !user?.currentClassId) {
        router.replace('/joinClass');
      }
    }, [user?.role, user?.currentClassId, router])
  );

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
  } else if (user.role === 'staff') {
    return <StaffRequest />;
  }

  // No access for other roles
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-gray-600">Access restricted</Text>
    </View>
  );
}