import BottomNav from '@/components/BottomNav';
import { useClasses } from '@/contexts/ClassContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Check, Copy, Plus, Search, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ClassManagementScreen = () => {
  const { classes, pendingRequests, createClass, approvePendingRequest, rejectPendingRequest } = useClasses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [className, setClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleCreateClass = () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    const newClass = createClass(className);
    setClassName('');
    setShowCreateForm(false);
    Alert.alert('Success', `Class created successfully!\n\nJoin Code: ${newClass.joinCode}`, [
      { text: 'OK' }
    ]);
  };

  const copyToClipboard = (text: string) => {
    // In a real app, this would copy to clipboard
    Alert.alert('Copied', `${text} copied to clipboard!`);
  };

  const handleApproveStudent = (requestId: string, classId: string) => {
    approvePendingRequest(requestId, classId);
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      Alert.alert('Success', `${request.studentName} has been added to the class`);
    }
  };

  const handleRejectStudent = (requestId: string) => {
    rejectPendingRequest(requestId);
    Alert.alert('Success', 'Student request rejected');
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => setSelectedClass(item)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
            <BookOpen size={24} color="#f59e0b" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
            <Text className="text-gray-500">{item.code}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-full">
          <Users size={14} color="#f59e0b" />
          <Text className="text-orange-700 ml-1 font-medium">{item.studentCount}</Text>
        </View>
      </View>
      
      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-gray-500 mr-2">Join Code:</Text>
        <Text className="font-mono text-gray-700">{item.joinCode}</Text>
        <TouchableOpacity 
          className="ml-2"
          onPress={() => copyToClipboard(item.joinCode)}
        >
          <Copy size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <Image 
        source={{ uri: item.avatar }} 
        className="w-10 h-10 rounded-full"
      />
      <Text className="ml-3 text-gray-800 font-medium">{item.name}</Text>
    </View>
  );

  const renderPendingRequest = ({ item }: { item: any }) => {
    const classItem = classes.find(cls => cls.id === item.classId);
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center mb-3">
          {item.avatar && (
            <Image 
              source={{ uri: item.avatar }} 
              className="w-12 h-12 rounded-full"
            />
          )}
          {!item.avatar && (
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
              <Users size={20} color="#f59e0b" />
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800">{item.studentName}</Text>
            <Text className="text-gray-500 text-sm">Request to join {classItem?.name || 'class'}</Text>
          </View>
        </View>
        
        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity 
            className="flex-1 bg-red-50 border border-red-200 py-2.5 rounded-lg flex-row items-center justify-center"
            onPress={() => handleRejectStudent(item.id)}
          >
            <X size={18} color="#ef4444" />
            <Text className="text-red-700 font-medium ml-1">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 bg-green-50 border border-green-200 py-2.5 rounded-lg flex-row items-center justify-center"
            onPress={() => handleApproveStudent(item.id, item.classId)}
          >
            <Check size={18} color="#10b981" />
            <Text className="text-green-700 font-medium ml-1">Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#f59e0b', '#f97316']} 
        className="pb-8"
      >
        <View className="pt-16 pb-4 px-6">
          <Text className="text-white text-2xl font-bold">Class Management</Text>
          <Text className="text-white/90 mt-1">Create and manage your classes</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 -mt-6">
        {/* Create Class Form */}
        {showCreateForm ? (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Create New Class</Text>
            
            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Class Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Your Class Name"
                value={className}
                onChangeText={setClassName}
              />
            </View>
            
            <View className="flex-row">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center mr-2"
                onPress={() => setShowCreateForm(false)}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-orange-600 py-3 rounded-lg items-center"
                onPress={handleCreateClass}
              >
                <Text className="text-white font-bold">Create Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            className="flex-row items-center bg-white rounded-xl p-4 mb-6 shadow-sm"
            onPress={() => setShowCreateForm(true)}
          >
            <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
              <Plus size={20} color="#f59e0b" />
            </View>
            <Text className="ml-3 text-gray-800 font-bold">Create New Class</Text>
          </TouchableOpacity>
        )}
        
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">Pending Requests</Text>
              <TouchableOpacity onPress={() => setShowPendingRequests(!showPendingRequests)}>
                <Text className="text-blue-600 font-medium">
                  {showPendingRequests ? 'Hide' : 'Show'} ({pendingRequests.length})
                </Text>
              </TouchableOpacity>
            </View>
            
            {showPendingRequests && (
              <FlatList
                data={pendingRequests}
                keyExtractor={(item) => item.id}
                renderItem={renderPendingRequest}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
        
        {/* Class List */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4">
            <Search size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search classes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <Text className="text-lg font-bold text-gray-800 mb-3">Your Classes</Text>
          
          {classes.length > 0 ? (
            <FlatList
              data={classes}
              keyExtractor={(item) => item.id}
              renderItem={renderClassItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <BookOpen size={48} color="#d1d5db" />
              <Text className="text-gray-900 font-bold text-lg mt-4">No Classes Yet</Text>
              <Text className="text-gray-500 text-center mt-2">
                Create your first class to start managing students and tracking their CredPoints
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Student Roster Modal */}
      {selectedClass && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-md max-h-[80%]">
            <View className="p-5 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">{selectedClass.name}</Text>
                <TouchableOpacity onPress={() => setSelectedClass(null)}>
                  <Text className="text-blue-600 font-bold">Close</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 mt-1">Student Roster ({selectedClass.studentCount} students)</Text>
            </View>
            
            <View className="p-5">
              <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-4">
                <Text className="text-gray-700 font-medium">Join Code: {selectedClass.joinCode}</Text>
                <TouchableOpacity 
                  className="ml-auto"
                  onPress={() => copyToClipboard(selectedClass.joinCode)}
                >
                  <Copy size={16} color="#2563eb" />
                </TouchableOpacity>
              </View>
              
              <Text className="font-bold text-gray-800 mb-3">Students</Text>
              <ScrollView className="max-h-60">
                {selectedClass.students.length > 0 ? (
                  selectedClass.students.map((student: any, index: number) => (
                    <View key={index} className="flex-row items-center py-3 border-b border-gray-100">
                      <Image 
                        source={{ uri: student.avatar }} 
                        className="w-10 h-10 rounded-full"
                      />
                      <Text className="ml-3 text-gray-800 font-medium">{student.name}</Text>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-8">
                    <Users size={48} color="#cbd5e1" />
                    <Text className="text-gray-500 mt-3">No students enrolled yet</Text>
                    <Text className="text-gray-400 text-center mt-1">Share the join code for students to enroll</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            
            <View className="p-5 border-t border-gray-100">
              <TouchableOpacity 
                className="bg-orange-600 py-3 rounded-lg items-center"
                onPress={() => copyToClipboard(selectedClass.joinCode)}
              >
                <Text className="text-white font-bold">Copy Join Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <BottomNav />
    </View>
  );
};

export default ClassManagementScreen;