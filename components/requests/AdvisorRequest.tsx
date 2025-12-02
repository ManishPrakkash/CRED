import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Plus, Search, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PENDING_REQUESTS_KEY = '@cred_pending_requests_count';

export default function AdvisorRequest() {
  const router = useRouter();
  const { user, markNotificationAsRead, markNotificationAsReadByRequestId } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Get pending requests from notifications
  const pendingRequests = (user?.notifications || [])
    .filter(n => n.type === 'request_submitted' && !n.read && n.requestData)
    .map(n => n.requestData)
    .filter(Boolean);

  const historyRequests = [
    {
      id: '4',
      staffName: 'John Staff',
      staffId: 'ST001',
      points: 35,
      workDescription: 'Department event organization and coordination',
      submittedBy: 'John Staff',
      date: '2023-06-13',
      status: 'approved',
      actionBy: user?.name,
    },
    {
      id: '5',
      staffName: 'Sarah Smith',
      staffId: 'ST002',
      points: 25,
      workDescription: 'Student mentoring and academic support',
      submittedBy: 'Sarah Smith',
      date: '2023-06-12',
      status: 'approved',
      actionBy: user?.name,
    },
    {
      id: '6',
      staffName: 'Mike Johnson',
      staffId: 'ST003',
      points: 15,
      workDescription: 'Late monthly report submission',
      submittedBy: 'Mike Johnson',
      date: '2023-06-11',
      status: 'rejected',
      actionBy: user?.name,
      rejectionReason: 'Report submitted after deadline without prior notice',
    },
  ];

  const decrementPendingCount = async () => {
    try {
      const currentCount = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
      const newCount = Math.max(0, (currentCount ? parseInt(currentCount) : 0) - 1);
      await AsyncStorage.setItem(PENDING_REQUESTS_KEY, newCount.toString());
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  };

  const handleApprove = async (id: string) => {
    const request = pendingRequests.find(r => r.id === id);
    if (!request) return;

    // Send notification to staff
    await NotificationService.notifyStaffOfApproval(
      request.userId,
      user?.id || '',
      user?.name || 'HOD',
      request.id,
      request.workDescription,
      request.points
    );

    // Clear the request_submitted notification for this request
    await markNotificationAsReadByRequestId(request.id);

    // Decrement pending count
    await decrementPendingCount();

    Alert.alert('Success', `Request from ${request.staffName} approved for ${request.points} points`);
  };

  const handleReject = async (id: string) => {
    const request = pendingRequests.find(r => r.id === id);
    if (!request) return;

    Alert.prompt(
      'Reject Request',
      'Please provide a reason for rejection (optional):',
      async (reason) => {
        // Send notification to staff
        await NotificationService.notifyStaffOfRejection(
          request.userId,
          user?.id || '',
          user?.name || 'HOD',
          request.id,
          request.workDescription,
          reason
        );

        // Clear the request_submitted notification for this request
        await markNotificationAsReadByRequestId(request.id);

        // Decrement pending count
        await decrementPendingCount();

        Alert.alert('Request Rejected', `Request from ${request.staffName} has been rejected`);
      },
      'plain-text'
    );
  };

  const renderPendingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/requestDetail',
          params: {
            requestData: JSON.stringify(item)
          }
        });
      }}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <User size={20} color="#10b981" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-gray-900">{item.staffName}</Text>
                <Text className="text-gray-500 text-sm">{item.staffId || item.userId}</Text>
              </View>
            </View>
            <View className="px-3 py-1 rounded-full self-start bg-orange-100">
              <Text className="text-sm font-bold text-orange-700">
                +{item.points} points requested
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-600 text-xs font-medium mb-1">Work Description:</Text>
          <Text className="text-gray-800">{item.workDescription}</Text>
        </View>
        
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="mb-3">
            <Text className="text-gray-500 text-xs">Submitted by: {item.staffName}</Text>
            <Text className="text-gray-400 text-xs">{item.date} • {item.time}</Text>
          </View>
          
          <View className="flex-row gap-2">
            <TouchableOpacity 
              onPress={() => handleApprove(item.id)}
              className="flex-1 bg-green-100 px-4 py-2 rounded-lg flex-row items-center justify-center"
            >
              <Check size={16} color="#10b981" />
              <Text className="text-green-700 ml-1 font-medium">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleReject(item.id)}
              className="flex-1 bg-red-100 px-4 py-2 rounded-lg flex-row items-center justify-center"
            >
              <X size={16} color="#ef4444" />
              <Text className="text-red-700 ml-1 font-medium">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="font-bold text-gray-900">{item.staffName}</Text>
          <Text className="text-gray-500 text-sm mb-2">{item.staffId}</Text>
          <View className="bg-gray-50 rounded-lg p-3 mb-2">
            <Text className="text-gray-800">{item.workDescription}</Text>
          </View>
          <Text className="text-gray-500 text-xs">By: {item.submittedBy}</Text>
          <Text className="text-gray-400 text-xs">{item.date}</Text>
          {item.rejectionReason && (
            <Text className="text-red-600 text-xs mt-2">Reason: {item.rejectionReason}</Text>
          )}
        </View>
        <View className="items-end">
          <Text className="font-bold text-lg text-orange-600">
            +{item.points}
          </Text>
          <View className={`mt-2 px-3 py-1 rounded-full ${
            item.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'approved' ? 'text-green-700' : 'text-red-700'
            }`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#10b981', '#059669']} 
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Staff Work Requests</Text>
        <Text className="text-white/90 mt-1">Review and approve staff work submissions</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View className="flex-row bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
          <TouchableOpacity 
            onPress={() => setActiveTab('pending')}
            className="flex-1 py-4 items-center"
            style={{ backgroundColor: activeTab === 'pending' ? '#10b981' : '#f9fafb' }}
          >
            <Text className={`font-bold ${activeTab === 'pending' ? 'text-white' : 'text-gray-700'}`}>
              Pending ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('history')}
            className="flex-1 py-4 items-center"
            style={{ backgroundColor: activeTab === 'history' ? '#10b981' : '#f9fafb' }}
          >
            <Text className={`font-bold ${activeTab === 'history' ? 'text-white' : 'text-gray-700'}`}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
          <Search size={20} color="#64748b" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search by staff name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Requests List */}
        {activeTab === 'pending' ? (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderPendingItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-8 items-center">
                <Text className="text-gray-500">No pending requests</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={historyRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-8 items-center">
                <Text className="text-gray-500">No history available</Text>
              </View>
            }
          />
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
