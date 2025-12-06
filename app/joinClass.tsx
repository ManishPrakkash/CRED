import LeaveClassModal from '@/components/LeaveClassModal';
import { useAuth } from '@/contexts/AuthContext';
import { validateAndCleanJoinedClasses } from '@/services/supabaseClasses';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, CheckCircle, Plus, LogOut, User } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function JoinClassScreen() {
  const router = useRouter();
  const { user, joinClass, switchClass, leaveClass, refreshJoinedClasses } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [classToLeave, setClassToLeave] = useState<{ id: string; name: string } | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Open leave modal only after classToLeave state is set
  useEffect(() => {
    if (classToLeave) {
      setShowLeaveModal(true);
    }
  }, [classToLeave]);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a class code');
      return;
    }

    try {
      setIsJoining(true);
      await joinClass(joinCode.trim());
      setJoinCode('');
      Alert.alert('Success', 'Class joined successfully! It has been added to your class list below.');
    } catch (error: any) {
      Alert.alert('Alert', error.message || 'Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSelectClass = async (classId: string) => {
    // Check if class still exists in database
    const { validClasses } = await validateAndCleanJoinedClasses(user!.id);
    const classStillExists = validClasses.some((jc) => jc.class_id === classId);

    if (!classStillExists) {
      Alert.alert(
        'Class Not Available',
        'This class has been deleted by the advisor. Please contact your advisor for assistance.',
        [{ text: 'OK' }]
      );
      // Refresh the list to remove deleted classes from UI
      await refreshJoinedClasses();
      return;
    }

    switchClass(classId);
    router.replace('/');
  };

  const handleLeaveClass = (classId: string, className: string) => {
    Alert.alert(
      'Leave Class',
      `Are you sure you want to leave "${className}"? You can rejoin later if needed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'default',
          onPress: () => {
            setClassToLeave({ id: classId, name: className });
          },
        },
      ]
    );
  };

  const confirmLeave = async () => {
    if (classToLeave) {
      try {
        const wasActiveClass = user?.currentClassId === classToLeave.id;
        await leaveClass(classToLeave.id);
        setShowLeaveModal(false);
        setClassToLeave(null);
        
        // If leaving active class, stay on joinClass page (router.replace prevents back navigation)
        if (wasActiveClass) {
          Alert.alert('Success', `You have left ${classToLeave.name}. Please select another class or join a new one.`);
          // Force stay on joinClass page by replacing navigation stack
          router.replace('/joinClass');
        } else {
          Alert.alert('Success', `You have left ${classToLeave.name}. You can rejoin anytime if needed.`);
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to leave class');
      }
    }
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    setClassToLeave(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#f59e0b', '#f97316']}
        className="pt-14 pb-8 px-6"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mt-2">
            <Text className="text-white text-3xl font-bold">My Classes</Text>
            <Text className="text-white/90 text-sm mt-1">Join and select your class</Text>
          </View>
          
          {/* Profile Icon */}
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mt-2"
            activeOpacity={0.7}
          >
            <User size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Join New Class Card */}
        <View className="bg-white rounded-xl p-6 mb-5 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-5 pb-4 border-b border-gray-100">
            <View className="w-12 h-12 rounded-lg bg-orange-100 items-center justify-center">
              <Plus size={24} color="#f59e0b" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 text-lg font-bold">Join New Class</Text>
              <Text className="text-gray-500 text-sm">Enter the class code provided by your HOD</Text>
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Class Code</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-center text-lg font-semibold tracking-wider bg-gray-50"
              placeholder="Enter code"
              placeholderTextColor="#9ca3af"
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
            />
          </View>

          <TouchableOpacity
            className={`py-3.5 rounded-lg items-center justify-center ${isJoining ? 'bg-orange-400' : 'bg-orange-600'} shadow-sm`}
            onPress={handleJoinClass}
            disabled={isJoining}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">
              {isJoining ? 'Joining...' : 'Join Class'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Classes List */}
        {user?.joinedClasses && user.joinedClasses.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-lg font-bold">Your Classes</Text>
              <View className="bg-orange-100 px-3 py-1.5 rounded-full">
                <Text className="text-orange-700 font-semibold text-xs">{user.joinedClasses.length} {user.joinedClasses.length === 1 ? 'class' : 'classes'}</Text>
              </View>
            </View>

            {user.joinedClasses.map((joinedClass, index) => (
              <View
                key={joinedClass.class_id}
                className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${user.currentClassId === joinedClass.class_id ? 'border-orange-500 border-2' : 'border-gray-200'
                  }`}
              >
                <TouchableOpacity
                  onPress={() => handleSelectClass(joinedClass.class_id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className={`w-11 h-11 rounded-lg items-center justify-center ${user.currentClassId === joinedClass.class_id ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                      <BookOpen size={20} color={user.currentClassId === joinedClass.class_id ? '#f59e0b' : '#6b7280'} />
                    </View>
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-gray-900 font-semibold text-base">{joinedClass.class_name}</Text>
                        {user.currentClassId === joinedClass.class_id && (
                          <View className="ml-2 bg-green-100 px-2 py-0.5 rounded">
                            <Text className="text-green-700 font-semibold text-xs">Active</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-500 text-sm">Code: {joinedClass.class_code}</Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        Joined {new Date(joinedClass.joined_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Leave Button */}
                <TouchableOpacity
                  onPress={() => handleLeaveClass(joinedClass.class_id, joinedClass.class_name)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-yellow-50 items-center justify-center border border-yellow-300"
                  activeOpacity={0.7}
                >
                  <LogOut size={16} color="#d97706" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Leave Class Modal */}
      {showLeaveModal && classToLeave && (
        <LeaveClassModal
          visible={showLeaveModal}
          targetClassName={classToLeave.name}
          onConfirm={confirmLeave}
          onCancel={cancelLeave}
        />
      )}
    </View>
  );
}
