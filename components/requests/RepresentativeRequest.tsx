import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { createRequest, getStaffRequests, Request, updateAndResubmitRequest } from '@/services/supabaseRequests';
import { createNotification } from '@/services/supabaseNotifications';
import { getClassById } from '@/services/supabaseClasses';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Plus, Search, User } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_REQUESTS_KEY = '@cred_pending_requests_count';
const CORRECTION_REQUESTS_KEY = '@cred_correction_requests_count';

export default function StaffRequest() {
  const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [workDescription, setWorkDescription] = useState('');
  const [requestedPoints, setRequestedPoints] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  
  const currentClass = user?.joinedClasses?.find(c => c.class_id === user?.currentClassId);

  // Fetch requests from database
  useEffect(() => {
    loadRequests();
  }, [user?.id]);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const requests = await getStaffRequests(user.id);
      setAllRequests(requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('Error', 'Failed to load your requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCorrectionRequest = (request: Request) => {
    setEditingRequestId(request.id);
    setWorkDescription(request.work_description);
    setRequestedPoints(request.requested_points.toString());
    setShowSubmitForm(true);
  };

  const handleUpdateRequest = async () => {
    if (!workDescription || !requestedPoints || !editingRequestId) {
      Alert.alert('Missing Information', 'Please provide work description and requested points');
      return;
    }

    const points = parseInt(requestedPoints);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Invalid Points', 'Please enter a valid positive number');
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await updateAndResubmitRequest(
        editingRequestId,
        workDescription,
        points
      );

      if (!result.success) {
        Alert.alert('Error', result.message);
        return;
      }

      Alert.alert(
        'Success',
        `Request updated and resubmitted: ${requestedPoints} points\nYour request will be reviewed again by the HOD.`
      );
      
      setWorkDescription('');
      setRequestedPoints('');
      setShowSubmitForm(false);
      setEditingRequestId(null);
      
      // Reload requests to show the updated one
      await loadRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
      Alert.alert('Error', 'Failed to update request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDateValue?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'dismissed' || event.type === 'set') {
      if (Platform.OS === 'ios') {
        // For iOS, only close on Done button
        return;
      }
    }
    
    if (selectedDateValue && event.type !== 'dismissed') {
      setSelectedDate(selectedDateValue);
    }
  };

  const handleIOSDone = () => {
    setShowDatePicker(false);
  };

  const handleIOSCancel = () => {
    setShowDatePicker(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.work_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    
    // Date filtering logic
    let matchesDate = true;
    if (selectedDate) {
      const requestDate = new Date(req.created_at);
      const filterDate = new Date(selectedDate);
      // Compare only year, month, and day
      matchesDate = requestDate.getFullYear() === filterDate.getFullYear() &&
                    requestDate.getMonth() === filterDate.getMonth() &&
                    requestDate.getDate() === filterDate.getDate();
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const handleSubmitRequest = async () => {
    if (!workDescription || !requestedPoints) {
      Alert.alert('Missing Information', 'Please provide work description and requested points');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const points = parseInt(requestedPoints);
    if (isNaN(points) || points <= 0) {
      Alert.alert('Invalid Points', 'Please enter a valid positive number');
      return;
    }

    // Get advisor ID from the current class
    let advisorId: string | null = null;
    
    if (currentClass?.class_id) {
      try {
        const classDetails = await getClassById(currentClass.class_id);
        advisorId = classDetails?.advisor_id || null;
      } catch (error) {
        console.error('Failed to fetch class details:', error);
      }
    }
    
    if (!advisorId) {
      Alert.alert('Error', 'No advisor assigned to your class. Please contact administration.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create request in database
      const result = await createRequest({
        staff_id: user.id,
        advisor_id: advisorId,
        class_id: currentClass?.class_id,
        work_description: workDescription,
        requested_points: points
      });

      if (!result.success) {
        Alert.alert('Error', result.message);
        return;
      }

      // Create notification for advisor about new request
      if (result.request) {
        await createNotification({
          user_id: advisorId,
          type: 'request_submitted',
          title: 'New Work Request',
          message: `${user.name || 'Staff'} submitted a request for ${points} CRED points`,
          related_request_id: result.request.id,
          request_data: {
            staff_id: user.id,
            staff_name: user.name,
            work_description: workDescription,
            requested_points: points,
            class_id: currentClass?.class_id,
            class_name: currentClass?.class_name
          }
        });
      }

      // Update AsyncStorage counts
      try {
        const currentPendingCount = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
        const newPendingCount = (currentPendingCount ? parseInt(currentPendingCount) : 0) + 1;
        await AsyncStorage.setItem(PENDING_REQUESTS_KEY, newPendingCount.toString());
      } catch (error) {
        console.error('Failed to update request counts:', error);
      }

      Alert.alert(
        'Success',
        `Work request submitted: ${requestedPoints} points\nYour request will be reviewed by the HOD.`
      );
      
      setWorkDescription('');
      setRequestedPoints('');
      setShowSubmitForm(false);
      
      // Reload requests to show the new one
      await loadRequests();
    } catch (error) {
      console.error('Failed to submit request:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'correction':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => {
    const statusColors = getStatusColor(item.status);
    const createdDate = new Date(item.created_at);
    const date = createdDate.toLocaleDateString();
    const time = createdDate.toLocaleTimeString();
    const respondedDate = item.responded_at ? new Date(item.responded_at).toLocaleDateString() : null;
    
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-gray-500 text-xs mb-1">{date} • {time}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColors.bg} border ${statusColors.border}`}>
            <Text className={`text-xs font-bold ${statusColors.text} capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className="px-3 py-2 rounded-lg bg-gray-50 mb-3">
          <Text className="text-gray-800 font-medium">{item.work_description}</Text>
        </View>

        <View className="flex-row gap-2 mb-2">
          <View className="px-3 py-1 rounded-full bg-orange-50">
            <Text className="text-sm font-bold text-orange-700">
              Requested: {item.requested_points} pts
            </Text>
          </View>
          {item.status === 'approved' && item.approved_points !== null && (
            <View className="px-3 py-1 rounded-full bg-green-50">
              <Text className="text-sm font-bold text-green-700">
                Approved: {item.approved_points} pts
              </Text>
            </View>
          )}
        </View>
        
        {(item.response_message || respondedDate) && (
          <View className="pt-3 border-t border-gray-100">
            {respondedDate && (
              <Text className="text-gray-500 text-xs mb-2">
                Reviewed on {respondedDate}
              </Text>
            )}
            {item.response_message && (
              <View className={`rounded-lg p-2 mb-2 ${item.status === 'rejected' ? 'bg-red-50' : item.status === 'correction' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <Text className={`text-xs font-medium ${item.status === 'rejected' ? 'text-red-700' : item.status === 'correction' ? 'text-yellow-700' : 'text-green-700'}`}>
                  {item.status === 'rejected' ? 'Rejection Reason: ' : item.status === 'correction' ? 'Correction Note: ' : 'Note: '}
                  {item.response_message}
                </Text>
              </View>
            )}
            {item.status === 'correction' && (
              <TouchableOpacity
                onPress={() => handleEditCorrectionRequest(item)}
                className="bg-yellow-600 py-2 px-4 rounded-lg flex-row items-center justify-center"
              >
                <Text className="text-white font-bold">Update & Resubmit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
    correction: allRequests.filter(r => r.status === 'correction').length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#f59e0b', '#f97316']} 
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Requests</Text>
        <Text className="text-white/90 mt-1">Submit work evidence and track your requests</Text>
        {currentClass && (
          <View className="mt-3 bg-white/20 rounded-lg px-3 py-2">
            <Text className="text-white text-sm font-medium">{currentClass.class_name} • {currentClass.class_code}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-700 font-bold mb-3">Request Summary</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{stats.total}</Text>
              <Text className="text-gray-500 text-xs">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">{stats.pending}</Text>
              <Text className="text-gray-500 text-xs">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">{stats.approved}</Text>
              <Text className="text-gray-500 text-xs">Approved</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-yellow-600">{stats.correction}</Text>
              <Text className="text-gray-500 text-xs">Correction</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">{stats.rejected}</Text>
              <Text className="text-gray-500 text-xs">Rejected</Text>
            </View>
          </View>
        </View>

        {/* Submit New Request Button */}
        <TouchableOpacity 
          onPress={() => setShowSubmitForm(!showSubmitForm)}
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border-2 border-orange-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
              <Plus size={24} color="#f97316" />
            </View>
            <View className="ml-3">
              <Text className="font-bold text-gray-900">Submit New Request</Text>
              <Text className="text-gray-600 text-sm">Request CredPoints for your work</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit Form */}
        {showSubmitForm && (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-orange-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {editingRequestId ? 'Update Request' : 'New Request'}
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Work Description *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 h-24"
                placeholder="Describe the work you completed (e.g., Lab maintenance, Student counseling, Workshop conducted)"
                multiline
                value={workDescription}
                onChangeText={setWorkDescription}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Requested CredPoints *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter points (e.g., 30, 50)"
                keyboardType="numeric"
                value={requestedPoints}
                onChangeText={setRequestedPoints}
              />
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => {
                  setShowSubmitForm(false);
                  setEditingRequestId(null);
                  setWorkDescription('');
                  setRequestedPoints('');
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                disabled={isSubmitting}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={editingRequestId ? handleUpdateRequest : handleSubmitRequest}
                className="flex-1 bg-orange-600 py-3 rounded-lg items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold">
                    {editingRequestId ? 'Update & Resubmit' : 'Submit to HOD'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm">
            <Search size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search work description..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            className={`bg-white rounded-xl px-4 py-3 shadow-sm items-center justify-center ${selectedDate ? 'border-2 border-green-500' : ''}`}
          >
            <Calendar size={20} color={selectedDate ? "#10b981" : "#64748b"} />
          </TouchableOpacity>
        </View>

        {/* Status Filter - Always Visible */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-700 font-bold mb-3">Filter by Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-full ${
                  filterStatus === status 
                    ? 'bg-orange-600' 
                    : 'bg-gray-100'
                }`}
              >
                <Text className={`font-medium capitalize ${
                  filterStatus === status 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Date Filter Display */}
        {selectedDate && (
          <View className="bg-orange-50 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between border border-orange-200">
            <Text className="text-orange-800 text-sm flex-1">
              Showing requests from <Text className="font-bold">{formatDateDisplay(selectedDate)}</Text>
            </Text>
            <TouchableOpacity onPress={clearDate}>
              <Text className="text-red-600 text-sm font-medium">Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <TouchableOpacity onPress={handleIOSCancel}>
                      <Text className="text-gray-600 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">
                      Select Date
                    </Text>
                    <TouchableOpacity onPress={handleIOSDone}>
                      <Text className="text-orange-600 font-bold">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )
        )}

        {/* Request History */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Request History ({filteredRequests.length})
          </Text>
          {isLoading ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-gray-500 mt-3">Loading requests...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequestItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="bg-white rounded-xl p-8 items-center">
                  <Text className="text-gray-500 text-center">
                    {searchQuery || filterStatus !== 'all' || selectedDate
                      ? 'No requests match your filters' 
                      : 'No work requests yet. Submit your first work request to earn CredPoints!'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
