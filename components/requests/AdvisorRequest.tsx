import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Plus, Search, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdvisorRequest() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<'add' | 'subtract'>('add');

  // Mock data for pending requests (from representatives)
  const pendingRequests = [
    {
      id: '1',
      studentName: 'Alex Johnson',
      studentId: 'S12345',
      points: 25,
      type: 'add',
      reason: 'Outstanding presentation in class',
      submittedBy: 'Jane Representative',
      date: '2023-06-15',
      time: '10:30 AM',
    },
    {
      id: '2',
      studentName: 'Maria Garcia',
      studentId: 'S67890',
      points: 15,
      type: 'subtract',
      reason: 'Late submission of assignment',
      submittedBy: 'John Rep',
      date: '2023-06-15',
      time: '09:15 AM',
    },
  ];

  const historyRequests = [
    {
      id: '3',
      studentName: 'James Wilson',
      studentId: 'S11223',
      points: 10,
      type: 'add',
      reason: 'Helping classmates with project',
      submittedBy: 'Dr. Advisor (Direct)',
      date: '2023-06-14',
      status: 'approved',
      actionBy: user?.name,
    },
    {
      id: '4',
      studentName: 'Sarah Miller',
      studentId: 'S44556',
      points: 20,
      type: 'subtract',
      reason: 'Disruptive behavior in class',
      submittedBy: 'Jane Representative',
      date: '2023-06-13',
      status: 'rejected',
      actionBy: user?.name,
    },
  ];

  const handleDirectAction = () => {
    if (!selectedStudent || !points || !reason) {
      alert('Please fill all fields');
      return;
    }
    alert(`${actionType === 'add' ? 'Added' : 'Subtracted'} ${points} points ${actionType === 'add' ? 'to' : 'from'} ${selectedStudent}`);
    setSelectedStudent('');
    setPoints('');
    setReason('');
    setShowQuickAction(false);
  };

  const handleApprove = (id: string) => {
    alert(`Request ${id} approved`);
  };

  const handleReject = (id: string) => {
    alert(`Request ${id} rejected`);
  };

  const renderPendingItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
              <User size={20} color="#f59e0b" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900">{item.studentName}</Text>
              <Text className="text-gray-500 text-sm">{item.studentId}</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full self-start ${item.type === 'add' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-sm font-bold ${item.type === 'add' ? 'text-green-700' : 'text-red-700'}`}>
              {item.type === 'add' ? '+' : '-'}{item.points} points
            </Text>
          </View>
        </View>
      </View>
      
      <Text className="text-gray-700 mb-2">{item.reason}</Text>
      
      <View className="mt-3 pt-3 border-t border-gray-100">
        <View className="mb-3">
          <Text className="text-gray-500 text-xs">Submitted by: {item.submittedBy}</Text>
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
  );

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="font-bold text-gray-900">{item.studentName}</Text>
          <Text className="text-gray-500 text-sm mb-2">{item.studentId}</Text>
          <Text className="text-gray-700 mb-2">{item.reason}</Text>
          <Text className="text-gray-500 text-xs">By: {item.submittedBy}</Text>
          <Text className="text-gray-400 text-xs">{item.date}</Text>
        </View>
        <View className="items-end">
          <Text className={`font-bold text-lg ${item.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
            {item.type === 'add' ? '+' : '-'}{item.points}
          </Text>
          <View className={`px-3 py-1 rounded-full mt-2 ${item.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${item.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
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
        colors={['#f59e0b', '#f97316']} 
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Point Management</Text>
        <Text className="text-white/90 mt-1">Approve requests & manage points directly</Text>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Quick Action Button */}
        <TouchableOpacity 
          onPress={() => setShowQuickAction(!showQuickAction)}
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border-2 border-orange-200 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
              <Plus size={24} color="#f59e0b" />
            </View>
            <View className="ml-3">
              <Text className="font-bold text-gray-900">Direct Point Action</Text>
              <Text className="text-gray-600 text-sm">Add or subtract points instantly</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Action Form */}
        {showQuickAction && (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-orange-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">Direct Point Action</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Action Type</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => setActionType('add')}
                  className={`flex-1 py-3 rounded-lg items-center ${actionType === 'add' ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100'}`}
                >
                  <Text className={`font-bold ${actionType === 'add' ? 'text-green-700' : 'text-gray-600'}`}>Add Points</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setActionType('subtract')}
                  className={`flex-1 py-3 rounded-lg items-center ${actionType === 'subtract' ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-100'}`}
                >
                  <Text className={`font-bold ${actionType === 'subtract' ? 'text-red-700' : 'text-gray-600'}`}>Subtract Points</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Student ID / Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter student ID or name"
                value={selectedStudent}
                onChangeText={setSelectedStudent}
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
                placeholder="Enter reason for this action"
                multiline
                value={reason}
                onChangeText={setReason}
              />
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowQuickAction(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDirectAction}
                className="flex-1 bg-orange-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
          <TouchableOpacity 
            onPress={() => setActiveTab('pending')}
            className="flex-1 py-4 items-center"
            style={{ backgroundColor: activeTab === 'pending' ? '#f59e0b' : '#f9fafb' }}
          >
            <Text className={`font-bold ${activeTab === 'pending' ? 'text-white' : 'text-gray-700'}`}>
              Pending ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('history')}
            className="flex-1 py-4 items-center"
            style={{ backgroundColor: activeTab === 'history' ? '#f59e0b' : '#f9fafb' }}
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
            placeholder="Search by student name or ID..."
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
