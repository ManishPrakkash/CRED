import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { getAdvisorPendingRequests, getAdvisorRequests, approveRequest, rejectRequest, requestCorrection, Request } from '@/services/supabaseRequests';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ClipboardList, Search, User, X, MessageCircle } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PENDING_REQUESTS_KEY = '@cred_pending_requests_count';

export default function AdvisorRequest() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adjustedPoints, setAdjustedPoints] = useState('');

  // Load requests from database
  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch pending requests
      const pending = await getAdvisorPendingRequests(user.id);
      setPendingRequests(pending || []);
      
      // Fetch all requests for history
      const allRequests = await getAdvisorRequests(user.id);
      const history = (allRequests || []).filter((r: any) => r.status !== 'pending');
      setHistoryRequests(history);
      
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

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

    setSelectedRequest(request);
    setAdjustedPoints(request.requested_points.toString());
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest) return;

    const points = parseInt(adjustedPoints);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Invalid Points', 'Please enter a valid positive number');
      return;
    }

    try {
      setIsProcessing(selectedRequest.id);
      setShowApprovalModal(false);
      
      const message = points !== selectedRequest.requested_points 
        ? `Adjusted from ${selectedRequest.requested_points} to ${points} points`
        : 'Approved as requested';

      const result = await approveRequest(
        selectedRequest.id,
        points,
        message
      );

      if (result.success) {
        await decrementPendingCount();
        Alert.alert('Success', `Request approved! ${selectedRequest.staff?.name} received ${points} CRED points.`);
        await loadRequests();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setIsProcessing(null);
      setSelectedRequest(null);
      setAdjustedPoints('');
    }
  };

  const handleReject = async (id: string) => {
    const request = pendingRequests.find(r => r.id === id);
    if (!request) return;

    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject the request from ${request.staff?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(id);
              
              const result = await rejectRequest(
                id,
                'Request does not meet requirements'
              );

              if (result.success) {
                await decrementPendingCount();
                Alert.alert('Request Rejected', `Request from ${request.staff?.name} has been rejected`);
                await loadRequests(); // Reload requests
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Failed to reject request:', error);
              Alert.alert('Error', 'Failed to reject request');
            } finally {
              setIsProcessing(null);
            }
          }
        }
      ]
    );
  };

  const handleRequestCorrection = async (id: string) => {
    const request = pendingRequests.find(r => r.id === id);
    if (!request) return;

    Alert.alert(
      'Request Correction',
      `Ask ${request.staff?.name} to make changes to this request?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setIsProcessing(id);
              
              const result = await requestCorrection(
                id,
                'Please review and provide more details for this request'
              );

              if (result.success) {
                await decrementPendingCount();
                Alert.alert('Correction Requested', `${request.staff?.name} will be notified to make changes`);
                await loadRequests(); // Reload requests
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Failed to request correction:', error);
              Alert.alert('Error', 'Failed to request correction');
            } finally {
              setIsProcessing(null);
            }
          }
        }
      ]
    );
  };

  const renderPendingItem = ({ item }: { item: any }) => {
    const createdDate = new Date(item.created_at);
    const date = createdDate.toLocaleDateString();
    const time = createdDate.toLocaleTimeString();
    const isProcessingThis = isProcessing === item.id;

    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <User size={20} color="#10b981" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-gray-900">{item.staff?.name || 'Unknown'}</Text>
                <Text className="text-gray-500 text-sm">{item.staff?.employee_id || item.staff?.email}</Text>
              </View>
            </View>
            <View className="px-3 py-1 rounded-full self-start bg-green-100">
              <Text className="text-sm font-bold text-green-700">
                +{item.requested_points} points requested
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-600 text-xs font-medium mb-1">Work Description:</Text>
          <Text className="text-gray-800">{item.work_description}</Text>
        </View>
        
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="mb-3">
            <Text className="text-gray-500 text-xs">Submitted by: {item.staff?.name}</Text>
            <Text className="text-gray-400 text-xs">{date} • {time}</Text>
          </View>
          
          {isProcessingThis ? (
            <View className="py-3 items-center">
              <ActivityIndicator size="small" color="#10b981" />
            </View>
          ) : (
            <>
              <View className="flex-row gap-2 mb-2">
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
              <TouchableOpacity 
                onPress={() => handleRequestCorrection(item.id)}
                className="bg-yellow-100 px-4 py-2 rounded-lg flex-row items-center justify-center"
              >
                <MessageCircle size={16} color="#f59e0b" />
                <Text className="text-yellow-700 ml-1 font-medium">Request Correction</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const respondedDate = item.responded_at ? new Date(item.responded_at).toLocaleDateString() : 'N/A';
    
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-bold text-gray-900">{item.staff?.name || 'Unknown'}</Text>
            <Text className="text-gray-500 text-sm mb-2">{item.staff?.employee_id || item.staff?.email}</Text>
            <View className="bg-gray-50 rounded-lg p-3 mb-2">
              <Text className="text-gray-800">{item.work_description}</Text>
            </View>
            <Text className="text-gray-500 text-xs">Reviewed: {respondedDate}</Text>
            {item.response_message && (
              <View className={`mt-2 p-2 rounded-lg ${
                item.status === 'rejected' ? 'bg-red-50' : 
                item.status === 'correction' ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <Text className={`text-xs ${
                  item.status === 'rejected' ? 'text-red-700' : 
                  item.status === 'correction' ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {item.status === 'rejected' ? 'Rejection: ' : 
                   item.status === 'correction' ? 'Correction: ' : 'Note: '}
                  {item.response_message}
                </Text>
              </View>
            )}
          </View>
          <View className="items-end">
            <View className="mb-2">
              <Text className="text-xs text-gray-500">Requested:</Text>
              <Text className="font-bold text-lg text-gray-600">
                {item.requested_points}
              </Text>
            </View>
            {item.status === 'approved' && item.approved_points !== null && (
              <View className="mb-2">
                <Text className="text-xs text-gray-500">Approved:</Text>
                <Text className="font-bold text-lg text-green-600">
                  {item.approved_points}
                </Text>
              </View>
            )}
            <View className={`px-3 py-1 rounded-full ${
              item.status === 'approved' ? 'bg-green-100' : 
              item.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <Text className={`text-xs font-medium capitalize ${
                item.status === 'approved' ? 'text-green-700' : 
                item.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
        {isLoading ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-500 mt-3">Loading requests...</Text>
          </View>
        ) : activeTab === 'pending' ? (
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

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-xl font-bold text-gray-900 mb-2">Approve Request</Text>
            
            {selectedRequest && (
              <>
                <View className="bg-gray-50 rounded-lg p-3 mb-4">
                  <Text className="text-gray-600 text-sm mb-1">Staff: {selectedRequest.staff?.name}</Text>
                  <Text className="text-gray-600 text-sm mb-2">Requested: {selectedRequest.requested_points} points</Text>
                  <Text className="text-gray-800 text-sm">{selectedRequest.work_description}</Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-2">Approve Points *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-lg"
                    placeholder="Enter points to approve"
                    keyboardType="numeric"
                    value={adjustedPoints}
                    onChangeText={setAdjustedPoints}
                    autoFocus
                  />
                  {adjustedPoints && parseInt(adjustedPoints) !== selectedRequest.requested_points && (
                    <Text className="text-yellow-600 text-xs mt-1">
                      ⚠️ Points will be adjusted from {selectedRequest.requested_points} to {adjustedPoints}
                    </Text>
                  )}
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowApprovalModal(false);
                      setSelectedRequest(null);
                      setAdjustedPoints('');
                    }}
                    className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                  >
                    <Text className="text-gray-700 font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmApproval}
                    className="flex-1 bg-green-600 py-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold">Approve</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}
