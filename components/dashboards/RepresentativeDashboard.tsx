import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    AlertCircle,
    Award,
    Bell,
    CheckCircle,
    ClipboardList,
    Clock,
    Plus,
    Send,
    TrendingUp
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function RepresentativeDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const repStats = [
    { title: 'Requests Submitted', value: '28', icon: <Send size={20} color="#2563eb" />, color: 'bg-blue-50' },
    { title: 'Pending Review', value: '5', icon: <Clock size={20} color="#f59e0b" />, color: 'bg-orange-50' },
    { title: 'Approved', value: '21', icon: <CheckCircle size={20} color="#10b981" />, color: 'bg-green-50' },
    { title: 'This Week', value: '7', icon: <TrendingUp size={20} color="#8b5cf6" />, color: 'bg-purple-50' },
  ];

  const recentRequests = [
    { id: 1, student: 'Alex Johnson', action: 'Add 25 points', reason: 'Outstanding presentation', status: 'pending', time: '10 min ago' },
    { id: 2, student: 'Maria Garcia', action: 'Subtract 15 points', reason: 'Late submission', status: 'approved', time: '1 hour ago' },
    { id: 3, student: 'James Wilson', action: 'Add 10 points', reason: 'Helping peers', status: 'approved', time: '2 hours ago' },
    { id: 4, student: 'Sarah Miller', action: 'Add 30 points', reason: 'Perfect attendance', status: 'pending', time: '3 hours ago' },
  ];

  const quickActions = [
    { 
      title: 'Submit New Request', 
      desc: 'Add or subtract points', 
      icon: <Plus size={24} color="#2563eb" />,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      onPress: () => router.push('/request')
    },
    { 
      title: 'View All Requests', 
      desc: 'Check request history', 
      icon: <ClipboardList size={24} color="#10b981" />,
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      onPress: () => router.push('/request')
    },
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
            <Text className="text-white text-sm opacity-90">Representative Dashboard</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-full">
            <Bell size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Summary Card */}
        <View className="bg-white/20 rounded-2xl p-4 mt-4">
          <Text className="text-white/80 text-sm">Total Requests</Text>
          <View className="flex-row items-end justify-between mt-2">
            <View>
              <Text className="text-white text-4xl font-bold">28</Text>
              <Text className="text-white/90 text-sm mt-1">75% approval rate</Text>
            </View>
            <Award size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {repStats.map((stat, index) => (
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
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index}
                onPress={action.onPress}
                className={`flex-row items-center ${action.color} rounded-xl p-4 border ${action.borderColor}`}
              >
                <View className="p-2 bg-white rounded-lg">
                  {action.icon}
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-semibold">{action.title}</Text>
                  <Text className="text-gray-600 text-xs mt-1">{action.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
              className="py-3 border-b border-gray-100 last:border-0"
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{request.student}</Text>
                  <Text className="text-gray-600 text-sm mt-1">{request.action}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  request.status === 'pending' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    request.status === 'pending' ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {request.status === 'pending' ? 'Pending' : 'Approved'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-500 text-sm">Reason: {request.reason}</Text>
              <Text className="text-gray-400 text-xs mt-1">{request.time}</Text>
            </View>
          ))}
        </View>

        {/* Tips & Guidelines */}
        <View className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-blue-100">
          <View className="flex-row items-start">
            <View className="p-2 bg-blue-100 rounded-full">
              <AlertCircle size={20} color="#2563eb" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-900 font-bold mb-2">Representative Guidelines</Text>
              <Text className="text-gray-600 text-sm leading-5">
                • Be specific and detailed in request reasons{'\n'}
                • Submit requests promptly after incidents{'\n'}
                • Follow class point policies{'\n'}
                • Review advisor feedback regularly
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Summary */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-bold text-lg mb-4">This Month's Summary</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">Total Submitted</Text>
              <Text className="text-gray-900 font-bold">28</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Approved</Text>
              <Text className="text-green-600 font-bold">21 (75%)</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Rejected</Text>
              <Text className="text-red-600 font-bold">2 (7%)</Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-t border-gray-100">
              <Text className="text-gray-600">Pending</Text>
              <Text className="text-orange-600 font-bold">5 (18%)</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
