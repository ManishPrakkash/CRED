import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/contexts/ClassContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardList,
  Users
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AdvisorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { classes, pendingRequests, getTotalStats } = useClasses();

  const stats = getTotalStats();

  const advisorStats = [
    { title: 'Total Classes', value: stats.totalClasses.toString(), icon: <BookOpen size={20} color="#2563eb" />, color: 'bg-blue-50' },
    { title: 'Total Students', value: stats.totalStudents.toString(), icon: <Users size={20} color="#10b981" />, color: 'bg-green-50' },
    { title: 'Pending Requests', value: pendingRequests.length.toString(), icon: <ClipboardList size={20} color="#f59e0b" />, color: 'bg-orange-50' },
    { title: 'Avg Students/Class', value: stats.avgStudentsPerClass.toString(), icon: <CheckCircle size={20} color="#8b5cf6" />, color: 'bg-purple-50' },
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
            <Text className="text-white text-sm opacity-90">Advisor Dashboard</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
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
                <Text className="text-blue-600 text-xs mt-1">{pendingRequests.length} pending approvals</Text>
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
                <Text className="text-emerald-600 text-xs mt-1">{classes.length === 0 ? 'No classes yet' : `View your ${classes.length} class${classes.length !== 1 ? 'es' : ''}`}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Classes Overview */}
        {classes.length > 0 ? (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-bold text-lg">Active Classes</Text>
              <TouchableOpacity onPress={() => router.push('/classManagement')}>
                <Text className="text-blue-600 text-sm font-medium">Manage</Text>
              </TouchableOpacity>
            </View>
            
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => router.push('/classManagement')}
                className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100"
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">{cls.name}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{cls.studentCount} student{cls.studentCount !== 1 ? 's' : ''} enrolled</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm items-center">
            <BookOpen size={48} color="#d1d5db" />
            <Text className="text-gray-900 font-bold text-lg mt-4">No Classes Yet</Text>
            <Text className="text-gray-500 text-center mt-2 mb-4">Create your first class to start managing students and points</Text>
            <TouchableOpacity 
              onPress={() => router.push('/classManagement')}
              className="bg-orange-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Create Class</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
