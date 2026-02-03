import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/contexts/ClassContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ClipboardList,
  Users,
  Trophy,
  Bell
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getAdvisorPendingRequests } from '@/services/supabaseRequests';

export default function AdvisorDashboard() {
  const router = useRouter();
  const { user, unreadCount } = useAuth();
  const { classes, getTotalStats } = useClasses();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const stats = getTotalStats();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (user?.id) {
        try {
          const requests = await getAdvisorPendingRequests(user.id);
          setPendingRequestsCount(requests?.length || 0);
        } catch (error) {
          console.error('Failed to fetch pending requests:', error);
          setPendingRequestsCount(0);
        }
      }
    };

    fetchPendingRequests();
  }, [user?.id]);

  const advisorStats = [
    { title: 'Active Classes', value: stats.totalClasses.toString(), icon: <BookOpen size={20} color="#2563eb" />, color: 'bg-blue-50' },
    { title: 'Total Staff', value: stats.totalStaff.toString(), icon: <Users size={20} color="#10b981" />, color: 'bg-green-50' },
    { title: 'Pending Requests', value: pendingRequestsCount.toString(), icon: <ClipboardList size={20} color="#10b981" />, color: 'bg-green-50' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-90">HoD Dashboard</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
          <TouchableOpacity
            className="p-2 bg-white/20 rounded-lg relative"
            onPress={() => router.push('/notifications')}
          >
            <Bell size={18} color="white" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {advisorStats.map((stat, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 flex-1 min-w-[30%] shadow-sm"
            >
              <View className={`p-2 ${stat.color} rounded-lg self-start mb-2`}>
                {stat.icon}
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stat.value}</Text>
              <Text className="text-gray-500 text-sm mt-1">{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-gray-900 font-bold text-base mb-3">Quick Actions</Text>
          <View className="gap-2">
            <TouchableOpacity
              onPress={() => router.push('/request')}
              className="flex-row items-center bg-blue-50 rounded-lg p-3 border border-blue-100"
            >
              <View className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList size={18} color="#2563eb" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-blue-900 font-semibold text-sm">Review Requests</Text>
                <Text className="text-blue-600 text-xs mt-0.5">{pendingRequestsCount} pending</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/leaderboard')}
              className="flex-row items-center bg-green-50 rounded-lg p-3 border border-green-100"
            >
              <View className="p-2 bg-green-100 rounded-lg">
                <Trophy size={18} color="#10b981" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-green-900 font-semibold text-sm">View Leaderboards</Text>
                <Text className="text-green-600 text-xs mt-0.5">Class performance rankings</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Classes Overview - Compact */}
        {classes.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <View className="mb-3">
              <Text className="text-gray-900 font-bold text-base">Your Classes</Text>
            </View>

            <View className="gap-2">
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  onPress={() => router.push('/classManagement')}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex-row items-center"
                >
                  <View className="p-2 bg-green-100 rounded-lg mr-3">
                    <BookOpen size={18} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-sm">{cls.class_name}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Code: {cls.class_code}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
