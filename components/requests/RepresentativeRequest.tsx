import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, Plus, Search, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RepresentativeRequest() {
  const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [requestType, setRequestType] = useState<'add' | 'subtract'>('add');
  const [studentId, setStudentId] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for all requests (no separate pending, just history with statuses)
  const allRequests = [
    {
      id: '1',
      studentName: 'Alex Johnson',
      studentId: 'S12345',
      points: 25,
      type: 'add',
      reason: 'Outstanding presentation in class',
      date: '2023-06-15',
      time: '10:30 AM',
      status: 'pending',
      reviewedBy: null,
    },
    {
      id: '2',
      studentName: 'Maria Garcia',
      studentId: 'S67890',
      points: 15,
      type: 'subtract',
      reason: 'Late submission of assignment',
      date: '2023-06-14',
      time: '09:15 AM',
      status: 'approved',
      reviewedBy: 'Dr. Advisor',
      reviewDate: '2023-06-14',
    },
    {
      id: '3',
      studentName: 'James Wilson',
      studentId: 'S11223',
      points: 10,
      type: 'add',
      reason: 'Helping classmates with project',
      date: '2023-06-13',
      time: '02:20 PM',
      status: 'approved',
      reviewedBy: 'Dr. Advisor',
      reviewDate: '2023-06-13',
    },
    {
      id: '4',
      studentName: 'Sarah Miller',
      studentId: 'S44556',
      points: 20,
      type: 'subtract',
      reason: 'Disruptive behavior',
      date: '2023-06-12',
      time: '11:45 AM',
      status: 'rejected',
      reviewedBy: 'Dr. Advisor',
      reviewDate: '2023-06-12',
      rejectionReason: 'Insufficient evidence',
    },
    {
      id: '5',
      studentName: 'David Kim',
      studentId: 'S99887',
      points: 30,
      type: 'add',
      reason: 'Excellent group project leadership',
      date: '2023-06-11',
      time: '03:30 PM',
      status: 'pending',
      reviewedBy: null,
    },
  ];

  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSubmitRequest = () => {
    if (!studentId || !points || !reason) {
      alert('Please fill all fields');
      return;
    }
    alert(`Request submitted for ${studentId}: ${requestType === 'add' ? '+' : '-'}${points} points`);
    setStudentId('');
    setPoints('');
    setReason('');
    setShowSubmitForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status);
    
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                <User size={20} color="#10b981" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-gray-900">{item.studentName}</Text>
                <Text className="text-gray-500 text-sm">{item.studentId}</Text>
              </View>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColors.bg} border ${statusColors.border}`}>
            <Text className={`text-xs font-bold ${statusColors.text} capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className={`px-3 py-1 rounded-full self-start mb-2 ${item.type === 'add' ? 'bg-green-50' : 'bg-red-50'}`}>
          <Text className={`text-sm font-bold ${item.type === 'add' ? 'text-green-700' : 'text-red-700'}`}>
            {item.type === 'add' ? '+' : '-'}{item.points} points
          </Text>
        </View>
        
        <Text className="text-gray-700 mb-3">{item.reason}</Text>
        
        <View className="pt-3 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-xs">Submitted: {item.date} • {item.time}</Text>
              {item.reviewedBy && (
                <Text className="text-gray-500 text-xs mt-1">
                  Reviewed by: {item.reviewedBy} {item.reviewDate && `on ${item.reviewDate}`}
                </Text>
              )}
            </View>
          </View>
          {item.status === 'rejected' && item.rejectionReason && (
            <View className="mt-2 bg-red-50 rounded-lg p-2">
              <Text className="text-red-700 text-xs font-medium">Reason: {item.rejectionReason}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#10b981', '#059669']} 
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Request Management</Text>
        <Text className="text-white/90 mt-1">Submit and track point change requests</Text>
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
              <Text className="text-2xl font-bold text-red-600">{stats.rejected}</Text>
              <Text className="text-gray-500 text-xs">Rejected</Text>
            </View>
          </View>
        </View>

        {/* Submit New Request Button */}
        <TouchableOpacity 
          onPress={() => setShowSubmitForm(!showSubmitForm)}
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border-2 border-green-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
              <Plus size={24} color="#10b981" />
            </View>
            <View className="ml-3">
              <Text className="font-bold text-gray-900">Submit New Request</Text>
              <Text className="text-gray-600 text-sm">Request point changes for students</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit Form */}
        {showSubmitForm && (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-green-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">New Request</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Request Type</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => setRequestType('add')}
                  className={`flex-1 py-3 rounded-lg items-center ${requestType === 'add' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100'}`}
                >
                  <Text className={`font-bold ${requestType === 'add' ? 'text-green-700' : 'text-gray-600'}`}>Add Points</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setRequestType('subtract')}
                  className={`flex-1 py-3 rounded-lg items-center ${requestType === 'subtract' ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-100'}`}
                >
                  <Text className={`font-bold ${requestType === 'subtract' ? 'text-red-700' : 'text-gray-600'}`}>Subtract Points</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Student ID</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter student ID"
                value={studentId}
                onChangeText={setStudentId}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Points</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter points"
                keyboardType="numeric"
                value={points}
                onChangeText={setPoints}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Reason</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 h-24"
                placeholder="Provide detailed reason for this request"
                multiline
                value={reason}
                onChangeText={setReason}
              />
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowSubmitForm(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmitRequest}
                className="flex-1 bg-green-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Submit Request</Text>
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
              placeholder="Search student..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            className="bg-white rounded-xl px-4 py-3 shadow-sm items-center justify-center"
          >
            <Filter size={20} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        {showFilters && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-700 font-bold mb-3">Filter by Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-full ${
                    filterStatus === status 
                      ? 'bg-green-600' 
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
        )}

        {/* Request History */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Request History ({filteredRequests.length})
          </Text>
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderRequestItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="bg-white rounded-xl p-8 items-center">
                <Text className="text-gray-500 text-center">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No requests match your filters' 
                    : 'No requests yet. Submit your first request!'}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}
