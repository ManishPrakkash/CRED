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
    Trophy
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const studentStats = [
    { title: 'Current Rank', value: '#5', subtitle: 'in your class', icon: <Trophy size={20} color="#f59e0b" />, color: 'bg-orange-50' },
    { title: 'Class Average', value: '980', subtitle: 'points', icon: <TrendingUp size={20} color="#2563eb" />, color: 'bg-blue-50' },
    { title: 'This Week', value: '+45', subtitle: 'points earned', icon: <Award size={20} color="#10b981" />, color: 'bg-green-50' },
  ];

  const recentActivity = [
    { id: 1, action: 'Assignment submitted on time', points: '+20', time: '2 hours ago', type: 'positive' },
    { id: 2, action: 'Helped peers in group project', points: '+15', time: '1 day ago', type: 'positive' },
    { id: 3, action: 'Late to class', points: '-10', time: '2 days ago', type: 'negative' },
    { id: 4, action: 'Perfect attendance this week', points: '+25', time: '3 days ago', type: 'positive' },
    { id: 5, action: 'Excellent quiz performance', points: '+30', time: '4 days ago', type: 'positive' },
  ];

  const achievements = [
    { id: 1, title: 'Perfect Week', desc: 'No late submissions', icon: '🏆' },
    { id: 2, title: 'Team Player', desc: 'Helped 5+ classmates', icon: '🤝' },
    { id: 3, title: 'Top Performer', desc: 'Top 10% in class', icon: '⭐' },
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
            <Text className="text-white text-sm opacity-90">Welcome back,</Text>
            <Text className="text-white text-2xl font-bold mt-1">{user?.name}</Text>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-full">
            <Bell size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* CredPoints Card */}
        <View className="bg-white/20 rounded-2xl p-4 mt-4">
          <Text className="text-white/80 text-sm">Your CredPoints</Text>
          <View className="flex-row items-end justify-between mt-2">
            <View>
              <Text className="text-white text-4xl font-bold">1,020</Text>
              <Text className="text-white/90 text-sm mt-1">+45 from last week</Text>
            </View>
            <Award size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          {studentStats.map((stat, index) => (
            <View 
              key={index} 
              className="bg-white rounded-xl p-3 flex-1 shadow-sm"
            >
              <View className={`p-2 ${stat.color} rounded-lg self-start mb-2`}>
                {stat.icon}
              </View>
              <Text className="text-xl font-bold text-gray-900">{stat.value}</Text>
              <Text className="text-gray-600 text-xs">{stat.title}</Text>
              <Text className="text-gray-400 text-xs">{stat.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Recent Achievements */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-bold text-lg mb-3">Recent Achievements</Text>
          <View className="flex-row gap-3">
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 flex-1 items-center"
              >
                <Text className="text-3xl mb-2">{achievement.icon}</Text>
                <Text className="text-gray-900 font-semibold text-xs text-center">{achievement.title}</Text>
                <Text className="text-gray-500 text-xs text-center mt-1">{achievement.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/progress')}>
              <Text className="text-blue-600 text-sm font-medium">View All</Text>
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
                <Text className="text-gray-900 font-medium text-sm">{activity.action}</Text>
                <Text className="text-gray-400 text-xs mt-1">{activity.time}</Text>
              </View>
              <Text className={`font-bold ${activity.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {activity.points}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
