import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Award, Calendar, CheckCircle, AlertTriangle, ChevronRight, TrendingDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ActivityItem {
  id: number;
  action: string;
  points: string;
  time: string;
  date: string;
  type: 'positive' | 'negative';
}

export default function ProgressScreen() {
  const { user, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');

  // Mock activity data
  const allActivities: ActivityItem[] = [
    { id: 1, action: 'Assignment submitted on time', points: '+20', time: '2 hours ago', date: '2023-11-13', type: 'positive' },
    { id: 2, action: 'Helped peers in group project', points: '+15', time: '1 day ago', date: '2023-11-12', type: 'positive' },
    { id: 3, action: 'Late to class', points: '-10', time: '2 days ago', date: '2023-11-11', type: 'negative' },
    { id: 4, action: 'Perfect attendance this week', points: '+25', time: '3 days ago', date: '2023-11-10', type: 'positive' },
    { id: 5, action: 'Excellent quiz performance', points: '+30', time: '4 days ago', date: '2023-11-09', type: 'positive' },
    { id: 6, action: 'Participated in class discussion', points: '+10', time: '5 days ago', date: '2023-11-08', type: 'positive' },
    { id: 7, action: 'Missed homework deadline', points: '-15', time: '6 days ago', date: '2023-11-07', type: 'negative' },
    { id: 8, action: 'Volunteered for presentation', points: '+20', time: '1 week ago', date: '2023-11-06', type: 'positive' },
    { id: 9, action: 'Lab report submitted early', points: '+15', time: '1 week ago', date: '2023-11-05', type: 'positive' },
    { id: 10, action: 'Helped organize study group', points: '+25', time: '1 week ago', date: '2023-11-04', type: 'positive' },
    { id: 11, action: 'Incomplete assignment', points: '-20', time: '2 weeks ago', date: '2023-10-30', type: 'negative' },
    { id: 12, action: 'Won class competition', points: '+50', time: '2 weeks ago', date: '2023-10-28', type: 'positive' },
    { id: 13, action: 'Perfect test score', points: '+40', time: '2 weeks ago', date: '2023-10-27', type: 'positive' },
    { id: 14, action: 'Active class participation', points: '+15', time: '3 weeks ago', date: '2023-10-20', type: 'positive' },
    { id: 15, action: 'Late submission', points: '-10', time: '3 weeks ago', date: '2023-10-18', type: 'negative' },
    { id: 16, action: 'Mentored junior students', points: '+30', time: '3 weeks ago', date: '2023-10-15', type: 'positive' },
    { id: 17, action: 'Project milestone completed', points: '+35', time: '1 month ago', date: '2023-10-13', type: 'positive' },
    { id: 18, action: 'Extra credit assignment', points: '+20', time: '1 month ago', date: '2023-10-10', type: 'positive' },
  ];

  // Analytics data
  const analytics = {
    totalPoints: 1020,
    weeklyGain: '+45',
    monthlyGain: '+180',
    totalActivities: allActivities.length,
    totalIncrease: allActivities.filter(a => a.type === 'positive').reduce((sum, a) => sum + parseInt(a.points), 0),
    totalDecrease: Math.abs(allActivities.filter(a => a.type === 'negative').reduce((sum, a) => sum + parseInt(a.points), 0)),
  };

  // Weekly progress data for chart
  const weeklyData = [
    { day: 'Mon', points: 20, label: 'M' },
    { day: 'Tue', points: 35, label: 'T' },
    { day: 'Wed', points: 15, label: 'W' },
    { day: 'Thu', points: 40, label: 'T' },
    { day: 'Fri', points: 30, label: 'F' },
    { day: 'Sat', points: 25, label: 'S' },
    { day: 'Sun', points: 10, label: 'S' },
  ];

  // Monthly progress data for chart
  const monthlyData = [
    { week: 'Week 1', points: 95, label: 'W1' },
    { week: 'Week 2', points: 120, label: 'W2' },
    { week: 'Week 3', points: 85, label: 'W3' },
    { week: 'Week 4', points: 110, label: 'W4' },
  ];

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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <View className="flex-row items-center mb-3">
          <TrendingUp size={32} color="#ffffff" />
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-white">My Progress</Text>
            <Text className="text-white/90 mt-1">Track your performance</Text>
          </View>
        </View>

        {/* Current Points Card */}
        <View className="bg-white/20 rounded-2xl p-4 mt-4">
          <Text className="text-white/80 text-sm">Total CRED Points</Text>
          <View className="flex-row items-end justify-between mt-2">
            <View>
              <Text className="text-white text-4xl font-bold">{analytics.totalPoints}</Text>
              <Text className="text-white/90 text-sm mt-1">{analytics.weeklyGain} this week</Text>
            </View>
            <Award size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Analytics Cards */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <View className="p-2 bg-green-50 rounded-lg self-start mb-2">
              <TrendingUp size={20} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">+{analytics.totalIncrease}</Text>
            <Text className="text-gray-500 text-sm mt-1">Credited</Text>
          </View>

          <View className="bg-white rounded-xl p-4 flex-1 min-w-[45%] shadow-sm">
            <View className="p-2 bg-red-50 rounded-lg self-start mb-2">
              <TrendingDown size={20} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">-{analytics.totalDecrease}</Text>
            <Text className="text-gray-500 text-sm mt-1">Debited</Text>
          </View>
        </View>

        {/* Progress Chart */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 font-bold text-lg">Progress Chart</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setChartView('weekly')}
                className={`px-3 py-1.5 rounded-lg ${chartView === 'weekly' ? 'bg-blue-600' : 'bg-gray-100'}`}
              >
                <Text className={`text-xs font-medium ${chartView === 'weekly' ? 'text-white' : 'text-gray-700'}`}>
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartView('monthly')}
                className={`px-3 py-1.5 rounded-lg ${chartView === 'monthly' ? 'bg-blue-600' : 'bg-gray-100'}`}
              >
                <Text className={`text-xs font-medium ${chartView === 'monthly' ? 'text-white' : 'text-gray-700'}`}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {chartView === 'weekly' ? (
            <View className="flex-row justify-between items-end h-40">
              {weeklyData.map((item, index) => {
                const maxHeight = 120;
                const height = (item.points / 40) * maxHeight;
                return (
                  <View key={index} className="items-center flex-1">
                    <View className="relative w-full items-center">
                      <Text className="text-blue-600 font-bold text-xs mb-1">+{item.points}</Text>
                      <View
                        className="bg-blue-500 rounded-t-lg w-10"
                        style={{ height: height }}
                      />
                    </View>
                    <Text className="text-gray-500 text-xs mt-2">{item.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="flex-row justify-between items-end h-40">
              {monthlyData.map((item, index) => {
                const maxHeight = 120;
                const height = (item.points / 120) * maxHeight;
                return (
                  <View key={index} className="items-center flex-1">
                    <View className="relative w-full items-center">
                      <Text className="text-blue-600 font-bold text-xs mb-1">+{item.points}</Text>
                      <View
                        className="bg-blue-500 rounded-t-lg w-12"
                        style={{ height: height }}
                      />
                    </View>
                    <Text className="text-gray-500 text-xs mt-2">{item.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Activity History */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-bold text-lg mb-4">
            Activity History ({allActivities.length})
          </Text>

          {allActivities.map((activity) => (
            <View
              key={activity.id}
              className="flex-row items-start py-3 border-b border-gray-100 last:border-0"
            >
              <View className={`p-2 rounded-lg mr-3 ${
                activity.type === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
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

        <View className="h-6" />
      </ScrollView>

      <BottomNav />
    </View>
  );
}
