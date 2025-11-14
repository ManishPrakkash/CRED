import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/contexts/ClassContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, Award, TrendingDown, TrendingUp, Trophy } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function LeaderboardScreen() {
  const { user, isLoading } = useAuth();
  const { classes } = useClasses();
  const [activeTab, setActiveTab] = useState<'green' | 'red'>('green');

  // Get all students from all classes
  const allStudents = useMemo(() => {
    const studentMap = new Map();
    
    classes.forEach(cls => {
      cls.students.forEach(student => {
        // Use student ID to avoid duplicates if student is in multiple classes
        if (!studentMap.has(student.id)) {
          studentMap.set(student.id, {
            id: student.id,
            name: student.name,
            studentId: student.email.split('@')[0].toUpperCase(), // Generate student ID from email
            credPoints: student.credPoints || 0,
            avatar: student.avatar
          });
        } else {
          // If student exists in multiple classes, sum their points
          const existing = studentMap.get(student.id);
          existing.credPoints += (student.credPoints || 0);
        }
      });
    });
    
    return Array.from(studentMap.values());
  }, [classes]);

  // Separate students into green (>=1500) and red (<1500) leaderboards
  const greenLeaderboard = allStudents
    .filter(s => s.credPoints >= 1500)
    .sort((a, b) => b.credPoints - a.credPoints);

  const redLeaderboard = allStudents
    .filter(s => s.credPoints < 1500)
    .sort((a, b) => a.credPoints - b.credPoints); // Ascending for red leaderboard (worst performers first)

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

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#64748b'; // Default gray
    }
  };

  const renderLeaderboardItem = (student: any, index: number, isGreen: boolean) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;
    
    return (
      <View
        key={student.id}
        className={`flex-row items-center p-4 mb-3 rounded-xl shadow-sm ${
          isTopThree
            ? isGreen
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300'
            : 'bg-white border border-gray-200'
        }`}
      >
        {/* Rank Badge */}
        <View className="items-center justify-center mr-4" style={{ width: 50 }}>
          {isGreen && isTopThree ? (
            <View className="items-center">
              <Trophy size={28} color={getMedalColor(rank)} />
              <Text className="text-xs font-bold mt-1" style={{ color: getMedalColor(rank) }}>
                #{rank}
              </Text>
            </View>
          ) : (
            <View 
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: isGreen ? '#dcfce7' : '#fee2e2'
              }}
            >
              <Text 
                className="font-bold text-lg"
                style={{
                  color: isGreen ? '#15803d' : '#dc2626'
                }}
              >
                {rank}
              </Text>
            </View>
          )}
        </View>

        {/* Student Info */}
        <View className="flex-1">
          <Text className={`font-bold text-base ${
            isTopThree ? 'text-gray-900' : 'text-gray-800'
          }`}>
            {student.name}
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">ID: {student.studentId}</Text>
        </View>

        {/* CRED Points */}
        <View className={`px-4 py-2 rounded-full ${
          isGreen ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <Text className="text-white font-bold text-base">{student.credPoints}</Text>
          <Text className="text-white/80 text-xs text-center">points</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={activeTab === 'green' ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <View className="flex-row items-center mb-3">
          <Trophy size={32} color="#ffffff" />
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-white">Leaderboard</Text>
            <Text className="text-white/90 mt-1">Class Performance Rankings</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-white/20 rounded-xl p-1 mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab('green')}
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              activeTab === 'green' ? 'bg-white' : ''
            }`}
          >
            <TrendingUp size={18} color={activeTab === 'green' ? '#10b981' : '#ffffff'} />
            <Text className={`ml-2 font-bold ${
              activeTab === 'green' ? 'text-green-600' : 'text-white'
            }`}>
              High Performers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('red')}
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              activeTab === 'red' ? 'bg-white' : ''
            }`}
          >
            <TrendingDown size={18} color={activeTab === 'red' ? '#ef4444' : '#ffffff'} />
            <Text className={`ml-2 font-bold ${
              activeTab === 'red' ? 'text-red-600' : 'text-white'
            }`}>
              Needs Improvement
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {allStudents.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center mt-8">
            <Trophy size={64} color="#cbd5e1" />
            <Text className="text-gray-700 font-bold text-lg mt-4">No Students Yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Create classes and add students to see the leaderboard
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Card */}
            <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Award size={20} color="#64748b" />
                <Text className="text-gray-700 font-bold ml-2">Statistics</Text>
              </View>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">{greenLeaderboard.length}</Text>
                  <Text className="text-gray-500 text-xs mt-1">≥1500 points</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-red-600">{redLeaderboard.length}</Text>
                  <Text className="text-gray-500 text-xs mt-1">&lt;1500 points</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900">{allStudents.length}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Total Students</Text>
                </View>
              </View>
            </View>

            {/* Green Leaderboard */}
            {activeTab === 'green' && (
              <View>
                {greenLeaderboard.length > 0 ? (
                  greenLeaderboard.map((student, index) => renderLeaderboardItem(student, index, true))
                ) : (
                  <View className="bg-white rounded-xl p-8 items-center">
                    <AlertCircle size={48} color="#64748b" />
                    <Text className="text-gray-500 text-center mt-4">
                      No students with 1500+ CRED points yet
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Red Leaderboard */}
            {activeTab === 'red' && (
              <View>
                {redLeaderboard.length > 0 ? (
                  redLeaderboard.map((student, index) => renderLeaderboardItem(student, index, false))
                ) : (
                  <View className="bg-white rounded-xl p-8 items-center">
                    <Award size={48} color="#10b981" />
                    <Text className="text-gray-500 text-center mt-4">
                      All students are performing excellently!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        <View className="h-6" />
      </ScrollView>

      <BottomNav />
    </View>
  );
}
