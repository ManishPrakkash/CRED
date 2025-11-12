import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    AlertCircle,
    Bell,
    BookOpen,
    CheckCircle,
    ClipboardList,
    TrendingUp,
    Users
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AdvisorDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const advisorStats = [
    { title: 'Total Classes', value: '3', icon: <BookOpen size={20} color="#2563eb" />, color: 'bg-blue-50' },
    { title: 'Total Students', value: '74', icon: <Users size={20} color="#10b981" />, color: 'bg-green-50' },
    { title: 'Pending Requests', value: '12', icon: <ClipboardList size={20} color="#f59e0b" />, color: 'bg-orange-50' },
    { title: 'Approved Today', value: '8', icon: <CheckCircle size={20} color="#8b5cf6" />, color: 'bg-purple-50' },
  ];

  const recentRequests = [
    { id: 1, student: 'Alex Johnson', action: 'Add 25 points', class: 'Math 101', status: 'pending', time: '10 min ago' },
    { id: 2, student: 'Maria Garcia', action: 'Subtract 15 points', class: 'Physics 201', status: 'pending', time: '1 hour ago' },
    { id: 3, student: 'James Wilson', action: 'Add 10 points', class: 'Chemistry Lab', status: 'approved', time: '2 hours ago' },
  ];

  const activeClasses = [
    { id: 1, name: 'Mathematics 101', students: 24, pending: 3, avgPoints: 985 },
    { id: 2, name: 'Physics Advanced', students: 18, pending: 2, avgPoints: 1020 },
    { id: 3, name: 'Chemistry Lab', students: 32, pending: 7, avgPoints: 950 },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#f59e0b', '#f97316']} 
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-sm opacity-90">Advisor Dashboard</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-full">
            <Bell size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {advisorStats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm"
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
          <Text className="text-gray-900 font-bold text-lg mb-3">Quick Actions</Text>
          <View className="gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/request')}
              className="flex-row items-center bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <View className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList size={20} color="#2563eb" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-blue-900 font-semibold">Review Requests</Text>
                <Text className="text-blue-600 text-xs mt-1">12 pending approvals</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/classManagement')}
              className="flex-row items-center bg-emerald-50 rounded-xl p-4 border border-emerald-200"
            >
              <View className="p-2 bg-emerald-100 rounded-lg">
                <BookOpen size={20} color="#10b981" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-emerald-900 font-semibold">Manage Classes</Text>
                <Text className="text-emerald-600 text-xs mt-1">View your 3 classes</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Requests */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Recent Requests</Text>
            <TouchableOpacity onPress={() => router.push('/request')}>
              <Text className="text-blue-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentRequests.map((request) => (
            <View 
              key={request.id} 
              className="flex-row items-center py-3 border-b border-gray-100 last:border-0"
            >
              <View className={`p-2 rounded-full mr-3 ${request.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'}`}>
                {request.status === 'pending' ? (
                  <AlertCircle size={16} color="#f59e0b" />
                ) : (
                  <CheckCircle size={16} color="#10b981" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{request.student}</Text>
                <Text className="text-gray-600 text-sm">{request.action} • {request.class}</Text>
                <Text className="text-gray-400 text-xs">{request.time}</Text>
              </View>
              {request.status === 'pending' && (
                <View className="px-3 py-1 bg-orange-100 rounded-full">
                  <Text className="text-orange-700 text-xs font-medium">Pending</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Active Classes Overview */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Active Classes</Text>
            <TouchableOpacity onPress={() => router.push('/classManagement')}>
              <Text className="text-blue-600 text-sm font-medium">Manage</Text>
            </TouchableOpacity>
          </View>
          
          {activeClasses.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              onPress={() => router.push('/classManagement')}
              className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">{cls.name}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{cls.students} students enrolled</Text>
                </View>
                {cls.pending > 0 && (
                  <View className="px-2 py-1 bg-orange-100 rounded-full">
                    <Text className="text-orange-700 text-xs font-medium">{cls.pending} pending</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center">
                <TrendingUp size={14} color="#10b981" />
                <Text className="text-gray-600 text-sm ml-1">Avg: {cls.avgPoints} points</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
