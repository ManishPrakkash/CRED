import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, FileText, Calendar, Clock, Paperclip, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_REQUESTS_KEY = '@cred_pending_requests_count';
const CORRECTION_REQUESTS_KEY = '@cred_correction_requests_count';

export default function RequestDetail() {
  const router = useRouter();
  const { user, markNotificationAsReadByRequestId } = useAuth();
  const params = useLocalSearchParams();
  
  // Parse the request data from params
  const requestData = params.requestData ? JSON.parse(params.requestData as string) : null;
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  if (!requestData) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">No request data found</Text>
      </View>
    );
  }

  const isAdvisor = user?.role === 'advisor';
  const isPending = requestData.status === 'pending';

  const decrementPendingCount = async () => {
    try {
      const currentCount = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
      const newCount = Math.max(0, (currentCount ? parseInt(currentCount) : 0) - 1);
      await AsyncStorage.setItem(PENDING_REQUESTS_KEY, newCount.toString());
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  };

  const incrementCorrectionCount = async () => {
    try {
      const currentCount = await AsyncStorage.getItem(CORRECTION_REQUESTS_KEY);
      const newCount = (currentCount ? parseInt(currentCount) : 0) + 1;
      await AsyncStorage.setItem(CORRECTION_REQUESTS_KEY, newCount.toString());
    } catch (error) {
      console.error('Failed to update correction count:', error);
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      'Approve Request',
      `Approve ${requestData.staffName}'s request for ${requestData.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            await NotificationService.notifyStaffOfApproval(
              requestData.userId,
              user?.id || '',
              user?.name || 'HOD',
              requestData.id,
              requestData.workDescription,
              requestData.points
            );
            await markNotificationAsReadByRequestId(requestData.id);
            await decrementPendingCount();
            Alert.alert('Success', 'Request approved successfully', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleReject = async () => {
    Alert.prompt(
      'Reject Request',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (!reason || reason.trim() === '') {
          Alert.alert('Error', 'Rejection reason is required');
          return;
        }
        await NotificationService.notifyStaffOfRejection(
          requestData.userId,
          user?.id || '',
          user?.name || 'HOD',
          requestData.id,
          requestData.workDescription,
          reason
        );
        await markNotificationAsReadByRequestId(requestData.id);
        await decrementPendingCount();
        Alert.alert('Request Rejected', 'Staff has been notified', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      'plain-text'
    );
  };

  const handleRequestCorrection = async () => {
    if (!correctionMessage.trim()) {
      Alert.alert('Error', 'Please enter correction details');
      return;
    }

    await NotificationService.notifyStaffOfCorrection(
      requestData.userId,
      user?.id || '',
      user?.name || 'HOD',
      requestData.id,
      requestData.workDescription,
      correctionMessage
    );

    await markNotificationAsReadByRequestId(requestData.id);
    await decrementPendingCount();
    await incrementCorrectionCount(); // Add to correction count

    Alert.alert('Correction Requested', 'Staff has been notified to make corrections', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={isAdvisor ? ['#10b981', '#059669'] : ['#f59e0b', '#f97316']}
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/20 rounded-lg"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Request Details</Text>
            <Text className="text-white/80 text-sm mt-1">
              {requestData.status === 'pending' ? 'Pending Review' : requestData.status}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Staff Info */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-xs font-medium mb-3">SUBMITTED BY</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
              <User size={24} color="#f59e0b" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900 text-lg">{requestData.staffName}</Text>
              <Text className="text-gray-500 text-sm">{requestData.staffId}</Text>
            </View>
          </View>
        </View>

        {/* Request Info */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-xs font-medium mb-3">REQUEST DETAILS</Text>
          
          <View className="flex-row items-center mb-3">
            <Calendar size={18} color="#6b7280" />
            <Text className="text-gray-600 ml-2">{requestData.date}</Text>
            <Clock size={18} color="#6b7280" className="ml-4" />
            <Text className="text-gray-600 ml-2">{requestData.time}</Text>
          </View>

          <View className="bg-orange-50 px-4 py-2 rounded-lg mb-3 self-start">
            <Text className="text-orange-700 font-bold text-lg">
              {requestData.points} Points Requested
            </Text>
          </View>

          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row items-start mb-2">
              <FileText size={18} color="#6b7280" />
              <Text className="text-gray-600 text-xs font-medium ml-2">WORK DESCRIPTION</Text>
            </View>
            <Text className="text-gray-800 leading-6">{requestData.workDescription}</Text>
          </View>
        </View>

        {/* Correction Input (only for advisor on pending requests) */}
        {isAdvisor && isPending && showCorrectionInput && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-3">Request Correction</Text>
            <TextInput
              className="bg-gray-50 rounded-lg p-3 min-h-[100px] text-gray-800"
              placeholder="Enter what needs to be corrected..."
              value={correctionMessage}
              onChangeText={setCorrectionMessage}
              multiline
              textAlignVertical="top"
            />
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => {
                  setCorrectionMessage('');
                  setShowCorrectionInput(false);
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-gray-700 text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestCorrection}
                className="flex-1 bg-blue-500 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons (only for advisor on pending requests) */}
        {isAdvisor && isPending && !showCorrectionInput && (
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={handleApprove}
              className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <CheckCircle size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-base">Approve Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCorrectionInput(true)}
              className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <AlertCircle size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-base">Request Correction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <XCircle size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-base">Reject Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Message for non-pending requests */}
        {!isPending && (
          <View className={`rounded-xl p-4 mb-6 ${
            requestData.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <View className="flex-row items-center">
              {requestData.status === 'approved' ? (
                <CheckCircle size={24} color="#10b981" />
              ) : (
                <XCircle size={24} color="#ef4444" />
              )}
              <Text className={`ml-3 font-semibold text-lg ${
                requestData.status === 'approved' ? 'text-green-700' : 'text-red-700'
              }`}>
                Request {requestData.status}
              </Text>
            </View>
            {requestData.reviewedBy && (
              <Text className="text-gray-600 text-sm mt-2">
                Reviewed by: {requestData.reviewedBy}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
