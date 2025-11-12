import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [credPoints, setCredPoints] = useState(1020);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Assignment submitted on time', points: '+20', time: '2 hours ago', type: 'positive' },
    { id: 2, action: 'Helped peers in group project', points: '+15', time: '1 day ago', type: 'positive' },
    { id: 3, action: 'Late to class', points: '-10', time: '2 days ago', type: 'negative' },
  ]);
  
  const upcomingTasks = [
    { id: 1, title: 'Math Assignment', due: 'Tomorrow', priority: 'high' },
    { id: 2, title: 'Science Project', due: 'In 3 days', priority: 'medium' },
    { id: 3, title: 'History Essay', due: 'Next week', priority: 'low' },
  ];

  const classStats = [
    { title: 'Current Rank', value: '#5', icon: <Award size={20} color="#10b981" /> },
    { title: 'Avg. Class Points', value: '980', icon: <TrendingUp size={20} color="#2563eb" /> },
    { title: 'Events This Week', value: '4', icon: <Calendar size={20} color="#64748b" /> },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#2563eb', '#3b82f6']} 
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Welcome back,</Text>
            <Text className="text-white text-lg">Alex Morgan</Text>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity className="p-2">
              <Bell size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <User size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* CredPoints Card */}
        <View className="bg-white/20 rounded-2xl p-4 mt-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-sm">Your CredPoints</Text>
            <Text className="text-white text-3xl font-bold">{credPoints}</Text>
            <Text className="text-white/80 text-xs mt-1">+20 from last week</Text>
          </View>
          <Award size={48} color="white" />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Quick Actions based on role */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.push('/request')} className={`flex-1 rounded-xl p-4 ${user?.role === 'representative' || user?.role === 'advisor' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`} disabled={!(user?.role === 'representative' || user?.role === 'advisor')}>
              <Text className={`${user?.role === 'representative' || user?.role === 'advisor' ? 'text-blue-700' : 'text-gray-400'} font-semibold`}>Requests</Text>
              <Text className="text-xs text-gray-500 mt-1">Submit or review point changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/classManagement')} className={`flex-1 rounded-xl p-4 ${user?.role === 'advisor' ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`} disabled={!(user?.role === 'advisor')}>
              <Text className={`${user?.role === 'advisor' ? 'text-emerald-700' : 'text-gray-400'} font-semibold`}>Classes</Text>
              <Text className="text-xs text-gray-500 mt-1">Create and manage classes</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Class Stats */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          {classStats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="p-2 bg-blue-50 rounded-lg mr-3">
                  {stat.icon}
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">{stat.title}</Text>
                  <Text className="text-gray-900 font-bold text-lg">{stat.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-blue-500 text-sm">View All</Text>
            </TouchableOpacity>
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
                <Text className="text-gray-500 text-xs">{activity.time}</Text>
              </View>
              <Text className={`font-bold ${activity.type === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {activity.points}
              </Text>
            </View>
          ))}
        </View>

        {/* Upcoming Tasks */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Upcoming Tasks</Text>
            <TouchableOpacity className="p-2 bg-blue-50 rounded-full">
              <Plus size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          {upcomingTasks.map((task) => (
            <View 
              key={task.id} 
              className="flex-row items-center py-3 border-b border-gray-100 last:border-0"
            >
              <View className={`w-3 h-3 rounded-full mr-3 ${
                task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{task.title}</Text>
                <Text className="text-gray-500 text-xs">Due: {task.due}</Text>
              </View>
              <TouchableOpacity className="p-2">
                <Clock size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Class Progress */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-900 font-bold text-lg mb-4">Class Progress</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Mathematics</Text>
            <Text className="text-gray-900 font-medium">85%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full mb-4">
            <View className="h-2 bg-blue-500 rounded-full" style={{ width: '85%' }} />
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Science</Text>
            <Text className="text-gray-900 font-medium">92%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full">
            <View className="h-2 bg-green-500 rounded-full" style={{ width: '92%' }} />
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
};

export default HomeScreen;