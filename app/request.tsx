import BottomNav from '@/components/BottomNav';
import { Calendar, Check, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RequestManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [requestType, setRequestType] = useState<'add' | 'subtract' | null>(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [studentId, setStudentId] = useState('');

  // Mock data for requests
  const pendingRequests = [
    {
      id: '1',
      studentName: 'Alex Johnson',
      studentId: 'S12345',
      points: 25,
      type: 'add',
      reason: 'Outstanding presentation in class',
      date: '2023-06-15',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
    },
    {
      id: '2',
      studentName: 'Maria Garcia',
      studentId: 'S67890',
      points: 15,
      type: 'subtract',
      reason: 'Late submission of assignment',
      date: '2023-06-14',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHVzZXJ8ZW58MHx8MHx8fDA%3D',
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
      date: '2023-06-10',
      status: 'approved',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHVzZXJ8ZW58MHx8MHx8fDA%3D',
    },
    {
      id: '4',
      studentName: 'Sarah Miller',
      studentId: 'S44556',
      points: 20,
      type: 'subtract',
      reason: 'Disruptive behavior in class',
      date: '2023-06-08',
      status: 'rejected',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHVzZXJ8ZW58MHx8MHx8fDA%3D',
    },
  ];



  const handleSubmitRequest = () => {
    // In a real app, this would submit the request
    alert('Request submitted successfully!');
    // Reset form
    setRequestType(null);
    setPoints('');
    setReason('');
    setStudentId('');
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <User size={20} color="#2563eb" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-gray-800">{item.studentName}</Text>
            <Text className="text-gray-500 text-sm">{item.studentId}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className={`font-bold ${item.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
            {item.type === 'add' ? '+' : '-'}{item.points} points
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-700 mb-2">{item.reason}</Text>
      
      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center">
          <Calendar size={16} color="#64748b" />
          <Text className="text-gray-500 text-sm ml-1">{item.date}</Text>
        </View>
        
        {item.status ? (
          <View className={`flex-row items-center px-3 py-1 rounded-full ${item.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
            {item.status === 'approved' ? (
              <Check size={14} color="#10b981" />
            ) : (
              <X size={14} color="#ef4444" />
            )}
            <Text className={`text-sm ml-1 ${item.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
              {item.status}
            </Text>
          </View>
        ) : (
          <View className="flex-row">
            <TouchableOpacity className="bg-green-100 px-3 py-1 rounded-lg flex-row items-center mr-2">
              <Check size={16} color="#10b981" />
              <Text className="text-green-700 ml-1">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-red-100 px-3 py-1 rounded-lg flex-row items-center">
              <X size={16} color="#ef4444" />
              <Text className="text-red-700 ml-1">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <Text className="text-2xl font-bold text-white">Request Management</Text>
        <Text className="text-blue-100 mt-1">Manage student CredPoint requests</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Request Form for Representatives */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Submit New Request</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Student ID</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Enter student ID"
              value={studentId}
              onChangeText={setStudentId}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Request Type</Text>
            <View className="flex-row">
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-l-lg items-center ${requestType === 'add' ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}
                onPress={() => setRequestType('add')}
              >
                <Text className={requestType === 'add' ? 'text-green-700 font-bold' : 'text-gray-700'}>Add Points</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-r-lg items-center border-l ${requestType === 'subtract' ? 'bg-red-100 border border-red-300' : 'bg-gray-100'}`}
                onPress={() => setRequestType('subtract')}
              >
                <Text className={requestType === 'subtract' ? 'text-red-700 font-bold' : 'text-gray-700'}>Subtract Points</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Points</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Enter points"
              keyboardType="numeric"
              value={points}
              onChangeText={setPoints}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Reason</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-24"
              placeholder="Enter reason for request"
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </View>
          
          <TouchableOpacity 
            className="bg-blue-600 py-3 rounded-lg items-center"
            onPress={handleSubmitRequest}
          >
            <Text className="text-white font-bold">Submit Request</Text>
          </TouchableOpacity>
        </View>
        
        {/* Requests Tabs */}
        <View className="flex-row bg-white rounded-xl mb-4">
          <TouchableOpacity 
            className={`flex-1 py-4 items-center rounded-l-xl ${activeTab === 'pending' ? 'bg-blue-600' : 'bg-gray-100'}`}
            onPress={() => setActiveTab('pending')}
          >
            <Text className={activeTab === 'pending' ? 'text-white font-bold' : 'text-gray-700'}>Pending Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-4 items-center rounded-r-xl ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-100'}`}
            onPress={() => setActiveTab('history')}
          >
            <Text className={activeTab === 'history' ? 'text-white font-bold' : 'text-gray-700'}>Request History</Text>
          </TouchableOpacity>
        </View>
        
        {/* Requests List */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-3">
            {activeTab === 'pending' ? 'Pending Requests' : 'Request History'}
          </Text>
          
          {activeTab === 'pending' ? (
            <FlatList
              data={pendingRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequestItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={historyRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderRequestItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
};

export default RequestManagementScreen;