import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ArrowLeft, Award, TrendingDown, TrendingUp, Trophy, Users } from 'lucide-react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  employee_id?: string;
  cred_points: number;
  avatar?: string | null;
}

interface ClassLeaderboardProps {
  classId: string;
  className: string;
  classCode: string;
  onClose: () => void;
}

export default function ClassLeaderboard({ classId, className, classCode, onClose }: ClassLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'green' | 'red'>('green');
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Fetch staff members enrolled in this specific class with their CRED points
  useEffect(() => {
    const fetchClassStaff = async () => {
      try {
        setLoadingStaff(true);
        console.log('[ClassLeaderboard] Fetching staff for class:', classId);

        // First, get all staff users
        const { data: allUsers, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, employee_id, cred_points, avatar, joined_classes')
          .eq('role', 'staff');

        if (usersError) {
          console.error('[ClassLeaderboard] Error fetching users:', usersError);
          return;
        }

        // Filter users who have this class in their joined_classes
        const enrolledStaff: StaffMember[] = [];
        (allUsers || []).forEach((user: any) => {
          const hasClass = (user.joined_classes || []).some((jc: any) => jc.class_id === classId);
          if (hasClass) {
            enrolledStaff.push({
              id: user.id,
              name: user.name,
              email: user.email,
              employee_id: user.employee_id,
              cred_points: user.cred_points || 0,
              avatar: user.avatar,
            });
          }
        });

        // Sort by cred_points descending
        enrolledStaff.sort((a, b) => b.cred_points - a.cred_points);

        console.log('[ClassLeaderboard] Enrolled staff found:', enrolledStaff.length);
        setStaffData(enrolledStaff);
      } catch (error) {
        console.error('[ClassLeaderboard] Error:', error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchClassStaff();
  }, [classId]);

  // Separate staff into green (>=1500) and red (<1500) leaderboards
  const greenLeaderboard = useMemo(() => {
    return staffData
      .filter(s => s.cred_points >= 1500)
      .sort((a, b) => b.cred_points - a.cred_points);
  }, [staffData]);

  const redLeaderboard = useMemo(() => {
    return staffData
      .filter(s => s.cred_points < 1500)
      .sort((a, b) => a.cred_points - b.cred_points); // Ascending for red leaderboard
  }, [staffData]);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#64748b';
    }
  };

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

  if (loadingStaff) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: '#6b7280', marginTop: 16 }}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <LinearGradient
        colors={activeTab === 'green' ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
        style={{ paddingTop: 48, paddingBottom: 16, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <TouchableOpacity 
          onPress={onClose}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
        >
          <ArrowLeft size={20} color="white" />
          <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Trophy size={24} color="#ffffff" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Class Leaderboard</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white', marginTop: 4 }}>{className}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2, fontSize: 13 }}>Code: {classCode}</Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: 12, 
          padding: 4, 
          marginTop: 12 
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('green')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'green' ? 'white' : 'transparent'
            }}
          >
            <TrendingUp size={16} color={activeTab === 'green' ? '#10b981' : '#ffffff'} />
            <Text style={{
              marginLeft: 8,
              fontWeight: 'bold',
              fontSize: 13,
              color: activeTab === 'green' ? '#10b981' : '#ffffff'
            }}>
              High Performers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('red')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeTab === 'red' ? 'white' : 'transparent'
            }}
          >
            <TrendingDown size={16} color={activeTab === 'red' ? '#ef4444' : '#ffffff'} />
            <Text style={{
              marginLeft: 8,
              fontWeight: 'bold',
              fontSize: 13,
              color: activeTab === 'red' ? '#ef4444' : '#ffffff'
            }}>
              Needs Improvement
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {staffData.length === 0 ? (
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center', marginTop: 32 }}>
            <Trophy size={64} color="#cbd5e1" />
            <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 18, marginTop: 16 }}>No Staff Enrolled</Text>
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
              Staff members will appear here once they join this class
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Card */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Award size={20} color="#64748b" />
                <Text style={{ color: '#374151', fontWeight: 'bold', marginLeft: 8 }}>Statistics</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>{greenLeaderboard.length}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>≥1500 points</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>{redLeaderboard.length}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>&lt;1500 points</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>{staffData.length}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Total Staff</Text>
                </View>
              </View>
            </View>

            {/* Green Leaderboard */}
            {activeTab === 'green' && (
              <View>
                {greenLeaderboard.length > 0 ? (
                  greenLeaderboard.map((staff, index) => renderLeaderboardItem(staff, index, true))
                ) : (
                  <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center' }}>
                    <AlertCircle size={48} color="#64748b" />
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16 }}>
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
                  <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, alignItems: 'center' }}>
                    <Award size={48} color="#10b981" />
                    <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16 }}>
                      All staff are performing excellently!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
