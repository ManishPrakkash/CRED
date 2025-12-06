import BottomNav from '@/components/BottomNav';
import ClassLeaderboard from '@/components/ClassLeaderboard';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/contexts/ClassContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { AlertCircle, Award, TrendingDown, TrendingUp, Trophy, Users, BookOpen } from 'lucide-react-native';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  employee_id?: string;
  cred_points: number;
  avatar?: string | null;
}

export default function LeaderboardScreen() {
  const { user, isLoading } = useAuth();
  const { classes } = useClasses();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'green' | 'red'>('green');
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string; code: string } | null>(null);
  const [showClassLeaderboard, setShowClassLeaderboard] = useState(false);

  // For advisors, show class selection first
  const isAdvisor = user?.role === 'advisor';

  // Redirect staff without active class to joinClass page
  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'staff' && !user?.currentClassId) {
        router.replace('/joinClass');
      }
    }, [user?.role, user?.currentClassId, router])
  );

  // Fetch staff members with their CRED points
  useEffect(() => {
    if (isAdvisor) return; // Advisors see class selection instead
    
    const fetchStaffData = async () => {
      try {
        setLoadingStaff(true);
        console.log('[Leaderboard] Fetching staff data for staff user...');
        
        // For staff users, only show leaderboard for their current class
        if (user?.role === 'staff' && user.currentClassId) {
          console.log('[Leaderboard] Filtering by current class:', user.currentClassId);
          
          // Get all users who are staff
          const { data: allStaff, error: staffError } = await supabase
            .from('users')
            .select('id, name, email, employee_id, cred_points, avatar, joined_classes')
            .eq('role', 'staff');

          if (staffError) {
            console.error('[Leaderboard] Error fetching staff:', staffError);
            return;
          }

          // Filter staff who have joined the current class
          const classStaff = (allStaff || []).filter(staff => {
            const joinedClasses = staff.joined_classes || [];
            return joinedClasses.some((jc: any) => jc.class_id === user.currentClassId);
          }).map(staff => ({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            employee_id: staff.employee_id,
            cred_points: staff.cred_points || 0,
            avatar: staff.avatar,
          }));

          console.log('[Leaderboard] Staff in current class:', classStaff.length);
          setStaffData(classStaff);
        } else {
          // Fallback: show all staff (shouldn't happen for staff users with a class)
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, employee_id, cred_points, avatar')
            .eq('role', 'staff')
            .order('cred_points', { ascending: false });

          if (error) {
            console.error('[Leaderboard] Error fetching staff:', error);
            return;
          }

          console.log('[Leaderboard] Staff data fetched:', data?.length || 0, 'staff members');
          setStaffData(data || []);
        }
      } catch (error) {
        console.error('[Leaderboard] Error:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaffData();
  }, [isAdvisor, user?.currentClassId]);

  // Separate staff into green (>=1500) and red (<1500) leaderboards
  const greenLeaderboard = useMemo(() => {
    return staffData
      .filter(s => s.cred_points >= 1500)
      .sort((a, b) => b.cred_points - a.cred_points);
  }, [staffData]);

  const redLeaderboard = useMemo(() => {
    return staffData
      .filter(s => s.cred_points < 1500)
      .sort((a, b) => a.cred_points - b.cred_points); // Ascending for red leaderboard (lowest performers first)
  }, [staffData]);

  if (isLoading || (!isAdvisor && loadingStaff)) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">Loading leaderboard...</Text>
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

  // Render staff member in leaderboard
  const renderLeaderboardItem = (staff: StaffMember, index: number, isGreen: boolean) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;
    const staffId = staff.employee_id || staff.email.split('@')[0].toUpperCase();
    
    return (
      <View
        key={staff.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          marginBottom: 12,
          borderRadius: 16,
          backgroundColor: isTopThree 
            ? (isGreen ? '#f0fdf4' : '#fef2f2')
            : 'white',
          borderWidth: isTopThree ? 2 : 1,
          borderColor: isTopThree
            ? (isGreen ? '#86efac' : '#fca5a5')
            : '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isTopThree ? 0.1 : 0.05,
          shadowRadius: 4,
          elevation: isTopThree ? 3 : 1,
        }}
      >
        {/* Rank Badge */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginRight: 16, width: 50 }}>
          {isGreen && isTopThree ? (
            <View style={{ alignItems: 'center' }}>
              <Trophy size={32} color={getMedalColor(rank)} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4, color: getMedalColor(rank) }}>
                #{rank}
              </Text>
            </View>
          ) : (
            <View 
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isGreen ? '#dcfce7' : '#fee2e2'
              }}
            >
              <Text 
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: isGreen ? '#15803d' : '#dc2626'
                }}
              >
                {rank}
              </Text>
            </View>
          )}
        </View>

        {/* Avatar */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isGreen ? '#d1fae5' : '#fecaca',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            borderWidth: 2,
            borderColor: isGreen ? '#a7f3d0' : '#fca5a5',
          }}
        >
          <Text style={{ 
            color: isGreen ? '#047857' : '#dc2626', 
            fontWeight: 'bold', 
            fontSize: 20 
          }}>
            {staff.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Staff Info */}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 16,
            color: isTopThree ? '#111827' : '#374151'
          }}>
            {staff.name}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>ID: {staffId}</Text>
        </View>

        {/* CRED Points */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: isGreen ? '#16a34a' : '#dc2626'
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
            {staff.cred_points}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
            points
          </Text>
        </View>
      </View>
    );
  };

  const handleClassClick = (classId: string, className: string, classCode: string) => {
    setSelectedClass({ id: classId, name: className, code: classCode });
    setShowClassLeaderboard(true);
  };

  const closeClassLeaderboard = () => {
    setShowClassLeaderboard(false);
    setSelectedClass(null);
  };

  // ADVISOR VIEW: Show class selection or leaderboard
  if (isAdvisor) {
    // If a class is selected, show the leaderboard directly
    if (showClassLeaderboard && selectedClass) {
      return (
        <ClassLeaderboard
          classId={selectedClass.id}
          className={selectedClass.name}
          classCode={selectedClass.code}
          onClose={closeClassLeaderboard}
        />
      );
    }

    // Otherwise show class selection
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          className="pt-12 pb-6 px-6 rounded-b-3xl"
        >
          <View className="flex-row items-center mb-3">
            <Trophy size={32} color="#ffffff" />
            <View className="ml-3 flex-1">
              <Text className="text-2xl font-bold text-white">Class Leaderboards</Text>
              <Text className="text-white/90 mt-1">Select a class to view rankings</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {classes.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center mt-8 shadow-sm">
              <View className="p-5 bg-green-50 rounded-full mb-4">
                <BookOpen size={48} color="#10b981" />
              </View>
              <Text className="text-gray-900 font-bold text-xl mb-2">No Classes Yet</Text>
              <Text className="text-gray-500 text-center mb-6 px-4">
                Create your first class to start tracking staff performance and CRED points
              </Text>
            </View>
          ) : (
            <>
              <View className="mb-4">
                <Text className="text-gray-700 font-bold text-lg mb-1">Your Classes</Text>
                <Text className="text-gray-500 text-sm">
                  {classes.length} class{classes.length !== 1 ? 'es' : ''} • Tap to view leaderboard
                </Text>
              </View>

              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  onPress={() => handleClassClick(cls.id, cls.class_name, cls.class_code)}
                  className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-green-100"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="p-3 bg-green-100 rounded-xl mr-3">
                        <Trophy size={24} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-bold text-lg">{cls.class_name}</Text>
                        <Text className="text-gray-500 text-sm mt-1">Code: {cls.class_code}</Text>
                      </View>
                    </View>
                    <View className="items-center">
                      <View className="flex-row items-center">
                        <Users size={16} color="#10b981" />
                        <Text className="text-green-700 font-bold text-sm ml-1">
                          {cls.current_enrollment || 0}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs mt-0.5">staff</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View className="h-6" />
        </ScrollView>

        <BottomNav />
      </View>
    );
  }

  // STAFF VIEW: Show global leaderboard
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
        {staffData.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center mt-8">
            <Trophy size={64} color="#cbd5e1" />
            <Text className="text-gray-700 font-bold text-lg mt-4">No Staff Data Yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Staff leaderboard will show CRED points earned by staff members
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
                  <Text className="text-2xl font-bold text-gray-900">{staffData.length}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Total Staff</Text>
                </View>
              </View>
            </View>

            {/* Green Leaderboard */}
            {activeTab === 'green' && (
              <View>
                {greenLeaderboard.length > 0 ? (
                  greenLeaderboard.map((staff, index) => renderLeaderboardItem(staff, index, true))
                ) : (
                  <View className="bg-white rounded-xl p-8 items-center">
                    <AlertCircle size={48} color="#64748b" />
                    <Text className="text-gray-500 text-center mt-4">
                      No staff with 1500+ CRED points yet
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Red Leaderboard */}
            {activeTab === 'red' && (
              <View>
                {redLeaderboard.length > 0 ? (
                  redLeaderboard.map((staff, index) => renderLeaderboardItem(staff, index, false))
                ) : (
                  <View className="bg-white rounded-xl p-8 items-center">
                    <Award size={48} color="#10b981" />
                    <Text className="text-gray-500 text-center mt-4">
                      All staff are performing excellently!
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
