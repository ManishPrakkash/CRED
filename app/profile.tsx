import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Award, Bell, LogOut, Mail, Shield, User, ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdvisor = user?.role === 'advisor';
  
  // Check if staff has no classes (accessed from joinClass page)
  const hasNoClasses = user?.role === 'staff' && (!user?.joinedClasses || user.joinedClasses.length === 0);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={isAdvisor ? ['#f59e0b', '#f97316'] : ['#2563eb', '#3b82f6']} 
        className="pt-12 pb-8 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Profile</Text>
        <Text className="text-white/90 mt-1">Manage your account settings</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Profile Card */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm items-center">
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <View 
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: isAdvisor ? '#fed7aa' : '#dbeafe' }}
            >
              <User size={48} color={isAdvisor ? '#f59e0b' : '#2563eb'} />
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
          <Text className="text-gray-500 mt-1">{user?.email}</Text>
          
          <View 
            className="flex-row items-center mt-3 px-4 py-2 rounded-full"
            style={{ backgroundColor: isAdvisor ? '#fed7aa' : '#dbeafe' }}
          >
            <Shield size={16} color={isAdvisor ? '#f59e0b' : '#2563eb'} />
            <Text 
              className="font-semibold ml-2 capitalize"
              style={{ color: isAdvisor ? '#ea580c' : '#2563eb' }}
            >
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Stats Card (if advisor) */}
        {user?.role === 'advisor' && (
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Your Statistics</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-blue-600">3</Text>
                <Text className="text-gray-500 text-sm mt-1">Classes</Text>
              </View>
              <View className="items-center flex-1 border-l border-gray-200">
                <Text className="text-3xl font-bold text-green-600">74</Text>
                <Text className="text-gray-500 text-sm mt-1">Staff</Text>
              </View>
              <View className="items-center flex-1 border-l border-gray-200">
                <Text className="text-3xl font-bold text-orange-600">12</Text>
                <Text className="text-gray-500 text-sm mt-1">Pending</Text>
              </View>
            </View>
          </View>
        )}

        {/* Join Class Button (if staff) */}
        {user?.role === 'staff' && (
          <TouchableOpacity
            onPress={() => setShowJoinClassModal(true)}
            className="bg-white rounded-xl p-5 mb-6 shadow-sm flex-row items-center"
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
              <Plus size={24} color="#2563eb" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-800">Join a Class</Text>
              <Text className="text-gray-500 text-sm">Enter class code to join</Text>
            </View>
            <BookOpen size={24} color="#6b7280" />
          </TouchableOpacity>
        )}

        {/* Account Settings */}
        <View className="bg-white rounded-xl mb-6 shadow-sm overflow-hidden">
          <Text className="text-lg font-bold text-gray-800 p-4 pb-2">Account Settings</Text>
          
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-t border-gray-100">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Mail size={20} color="#2563eb" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-medium">Email Settings</Text>
              <Text className="text-gray-500 text-sm">Manage your email preferences</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-t border-gray-100">
            <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
              <Bell size={20} color="#f59e0b" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-medium">Notifications</Text>
              <Text className="text-gray-500 text-sm">Configure notification preferences</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-t border-gray-100">
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
              <Award size={20} color="#10b981" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-800 font-medium">CredPoints History</Text>
              <Text className="text-gray-500 text-sm">View your complete activity log</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 rounded-xl p-4 mb-8 shadow-sm flex-row items-center justify-center"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-600 font-bold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Join Class Modal (for staff) */}
      <Modal
        visible={showJoinClassModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowJoinClassModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Join Class</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowJoinClassModal(false);
                  setClassCode('');
                }}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Enter the class code provided by your advisor to join the class.
            </Text>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Class Code</Text>
              <TextInput
                className="border-2 border-gray-300 rounded-lg p-4 text-lg font-mono"
                placeholder="e.g., CS301"
                value={classCode}
                onChangeText={setClassCode}
                autoCapitalize="characters"
                autoFocus={true}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowJoinClassModal(false);
                  setClassCode('');
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoinClass}
                disabled={loading}
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">
                  {loading ? 'Joining...' : 'Join Class'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <BottomNav />
    </View>
  );
}
