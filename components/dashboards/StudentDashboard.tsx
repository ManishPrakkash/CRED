import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    Award,
    Bell,
    BookOpen,
    CheckCircle,
    Clock,
    Plus,
    TrendingUp
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const currentClass = user?.joinedClasses?.find(c => c.id === user.currentClassId);

  const staffStats = [
    { title: 'Total Points', value: '850', icon: <Award size={20} color="#f59e0b" />, color: 'bg-orange-50' },
    { title: 'This Month', value: '+120', icon: <TrendingUp size={20} color="#10b981" />, color: 'bg-green-50' },
    { title: 'Pending Requests', value: '3', icon: <Clock size={20} color="#2563eb" />, color: 'bg-blue-50' },
  ];

  const recentActivity = [
    { id: 1, action: 'Lab equipment maintenance completed', points: '+50', time: '2 hours ago', type: 'positive' },
    { id: 2, action: 'Student counseling session', points: '+30', time: '1 day ago', type: 'positive' },
    { id: 3, action: 'Late report submission', points: '-10', time: '2 days ago', type: 'negative' },
    { id: 4, action: 'Extra workshop conducted', points: '+40', time: '3 days ago', type: 'positive' },
    { id: 5, action: 'Department event organized', points: '+60', time: '4 days ago', type: 'positive' },
  ];

  const pendingRequests = [
    { id: 1, work: 'Lab equipment setup', points: 50, status: 'pending', time: '2 hours ago' },
    { id: 2, work: 'Student mentoring session', points: 30, status: 'pending', time: '1 day ago' },
    { id: 3, work: 'Department documentation', points: 25, status: 'pending', time: '2 days ago' },
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
            <Text className="text-white text-sm opacity-90">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-full">
            <Bell size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Current Class Card */}
        <TouchableOpacity 
          className="bg-white/20 rounded-2xl p-4 mt-4"
          onPress={() => router.push('/joinClass')}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white/80 text-sm">Current Class</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {currentClass?.name || 'No class selected'}
              </Text>
              {currentClass && (
                <Text className="text-white/90 text-sm mt-1">Code: {currentClass.joinCode}</Text>
              )}
            </View>
            <BookOpen size={40} color="rgba(255,255,255,0.9)" />
          </View>
          <Text className="text-white/70 text-xs mt-3">Tap to switch class</Text>
        </TouchableOpacity>
        
        {/* CredPoints Card */}
        <View className="bg-white/20 rounded-2xl p-4 mt-3">
          <Text className="text-white/80 text-sm">Your CredPoints</Text>
          <View className="flex-row items-end justify-between mt-2">
            <View>
              <Text className="text-white text-4xl font-bold">850</Text>
              <Text className="text-white/90 text-sm mt-1">+120 this month</Text>
            </View>
            <Award size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {staffStats.map((stat, index) => (
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
          <Text className="text-gray-900 font-bold text-lg mb-3">Quick Actions</Text>
          <View className="gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/request')}
              className="flex-row items-center bg-orange-50 rounded-xl p-4 border border-orange-200"
            >
              <View className="p-2 bg-white rounded-lg">
                <Plus size={24} color="#f59e0b" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold">Submit Work Request</Text>
                <Text className="text-gray-600 text-xs mt-1">Request points for your work</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/joinClass')}
              className="flex-row items-center bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <View className="p-2 bg-white rounded-lg">
                <BookOpen size={24} color="#2563eb" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold">Manage Classes</Text>
                <Text className="text-gray-600 text-xs mt-1">Join or switch classes</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Requests */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Pending Requests</Text>
            <TouchableOpacity onPress={() => router.push('/request')}>
              <Text className="text-orange-600 text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {pendingRequests.slice(0, 3).map((request) => (
            <View 
              key={request.id} 
              className="py-3 border-b border-gray-100 last:border-0"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{request.work}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{request.time}</Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-orange-100">
                  <Text className="text-xs font-medium text-orange-700">Pending</Text>
                </View>
              </View>
              <Text className="text-orange-600 font-bold">+{request.points} points</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Recent Activity</Text>
          </View>
          
          {recentActivity.map((activity) => (
            <View 
              key={activity.id} 
              className="flex-row items-center py-3 border-b border-gray-100 last:border-0"
            >
              <View className={`p-2 rounded-full mr-3 ${activity.type === 'positive' ? 'bg-green-100' : 'bg-red-100'}`}>
                {activity.type === 'positive' ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : (
                  <AlertTriangle size={16} color="#ef4444" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{activity.action}</Text>
                <Text className="text-gray-500 text-xs mt-1">{activity.time}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${
                activity.type === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Text className={`font-bold text-sm ${
                  activity.type === 'positive' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {activity.points}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Summary */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-bold text-lg mb-4">This Month's Summary</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">Total Earned</Text>
              <Text className="text-gray-900 font-bold">850 points</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Approved Requests</Text>
              <Text className="text-green-600 font-bold">12</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Pending Review</Text>
              <Text className="text-orange-600 font-bold">3</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Rejected</Text>
              <Text className="text-red-600 font-bold">1</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
