import DeleteClassModal from '@/components/DeleteClassModal';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, CheckCircle, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function JoinClassScreen() {
  const router = useRouter();
  const { user, joinClass, switchClass, deleteClass } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);

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
      if (error.message.includes('already joined')) {
        Alert.alert('Already Joined', 'You have already joined this class. It has been set as your active class.');
      } else {
        Alert.alert('Error', error.message || 'Failed to join class');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleSelectClass = (classId: string) => {
    switchClass(classId);
    router.replace('/');
  };

  const handleDeleteClass = (classId: string, className: string) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to remove "${className}" from your classes? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setClassToDelete({ id: classId, name: className }),
        },
      ]
    );
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete.id);
      setClassToDelete(null);
      Alert.alert('Success', 'Class has been removed from your list.');
    }
  };

  const cancelDelete = () => {
    setClassToDelete(null);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#f59e0b', '#f97316']} 
        className="pt-14 pb-8 px-6"
      >
        <Text className="text-white text-3xl font-bold mt-2">My Classes</Text>
        <Text className="text-white/90 text-sm mt-1">Join and select your class</Text>
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
                key={joinedClass.id}
                className={`bg-white rounded-xl p-4 mb-3 shadow-sm border ${
                  user.currentClassId === joinedClass.id ? 'border-orange-500 border-2' : 'border-gray-200'
                }`}
              >
                <TouchableOpacity
                  onPress={() => handleSelectClass(joinedClass.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className={`w-11 h-11 rounded-lg items-center justify-center ${
                      user.currentClassId === joinedClass.id ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <BookOpen size={20} color={user.currentClassId === joinedClass.id ? '#f59e0b' : '#6b7280'} />
                    </View>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-900 font-semibold text-base">{joinedClass.name}</Text>
                      {user.currentClassId === joinedClass.id && (
                        <View className="ml-2 bg-green-100 px-2 py-0.5 rounded">
                          <Text className="text-green-700 font-semibold text-xs">Active</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-500 text-sm">Code: {joinedClass.joinCode}</Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      Joined {new Date(joinedClass.joinedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                  </View>
                </TouchableOpacity>
                
                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteClass(joinedClass.id, joinedClass.name)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-red-50 items-center justify-center border border-red-200"
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Class Modal */}
      <DeleteClassModal
        visible={classToDelete !== null}
        className={classToDelete?.name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}
