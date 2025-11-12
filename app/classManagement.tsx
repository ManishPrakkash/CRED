import BottomNav from '@/components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Check, Copy, MoreVertical, Plus, QrCode, Search, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Mock data for classes
const mockClasses = [
  {
    id: '1',
    name: 'Mathematics 101',
    code: 'MATH101',
    studentCount: 24,
    joinCode: 'MATH-101-2023',
    students: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60' },
      { id: '2', name: 'Maria Garcia', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60' },
      { id: '3', name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60' },
    ]
  },
  {
    id: '2',
    name: 'Physics Advanced',
    code: 'PHYS201',
    studentCount: 18,
    joinCode: 'PHYS-201-2023',
    students: [
      { id: '4', name: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60' },
      { id: '5', name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&auto=format&fit=crop&q=60' },
    ]
  },
  {
    id: '3',
    name: 'Chemistry Lab',
    code: 'CHEM150',
    studentCount: 32,
    joinCode: 'CHEM-150-2023',
    students: [
      { id: '6', name: 'Emma Thompson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60' },
      { id: '7', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=60' },
    ]
  }
];

// Mock pending student requests
const mockPendingRequests = [
  { id: '8', name: 'Robert Brown', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop&q=60', classId: '1' },
  { id: '9', name: 'Lisa Anderson', avatar: 'https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?w=900&auto=format&fit=crop&q=60', classId: '2' },
];

const ClassManagementScreen = () => {
  const [classes, setClasses] = useState(mockClasses);
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const handleCreateClass = () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    const newClass = {
      id: `${classes.length + 1}`,
      name: className,
      code: classCode || `CLASS-${classes.length + 1}`,
      studentCount: 0,
      joinCode: `${className.replace(/\s+/g, '-').toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      students: []
    };

    setClasses([newClass, ...classes]);
    setClassName('');
    setClassCode('');
    setShowCreateForm(false);
    Alert.alert('Success', `Class created successfully!\nJoin Code: ${newClass.joinCode}`);
  };

  const copyToClipboard = (text: string) => {
    // In a real app, this would copy to clipboard
    Alert.alert('Copied', `${text} copied to clipboard!`);
  };

  const handleJoinClass = () => {
    if (!joinCodeInput.trim()) {
      Alert.alert('Error', 'Please enter a join code');
      return;
    }

    const foundClass = classes.find(cls => cls.joinCode === joinCodeInput);
    if (foundClass) {
      Alert.alert('Success', `You have joined ${foundClass.name}`);
      setJoinCodeInput('');
    } else {
      Alert.alert('Error', 'Invalid join code. Please try again.');
    }
  };

  const handleApproveStudent = (studentId: string, classId: string) => {
    const student = pendingRequests.find(s => s.id === studentId);
    if (!student) return;

    // Add student to class
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: [...cls.students, student],
          studentCount: cls.studentCount + 1
        };
      }
      return cls;
    });

    // Remove from pending requests
    const updatedPending = pendingRequests.filter(s => s.id !== studentId);

    setClasses(updatedClasses);
    setPendingRequests(updatedPending);
    Alert.alert('Success', `${student.name} has been added to the class`);
  };

  const handleRejectStudent = (studentId: string) => {
    const updatedPending = pendingRequests.filter(s => s.id !== studentId);
    setPendingRequests(updatedPending);
    Alert.alert('Success', 'Student request rejected');
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => setSelectedClass(item)}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
            <BookOpen size={24} color="#2563eb" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
            <Text className="text-gray-500">{item.code}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full mr-3">
            <Users size={16} color="#2563eb" />
            <Text className="text-blue-700 ml-1 font-medium">{item.studentCount}</Text>
          </View>
          <MoreVertical size={20} color="#64748b" />
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
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: item.avatar }} 
            className="w-12 h-12 rounded-full"
          />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800">{item.name}</Text>
            <Text className="text-gray-500 text-sm">Request to join {classItem?.name || 'class'}</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2"
              onPress={() => handleRejectStudent(item.id)}
            >
              <X size={16} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-8 h-8 rounded-full bg-green-100 items-center justify-center"
              onPress={() => handleApproveStudent(item.id, item.classId)}
            >
              <Check size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient 
        colors={['#2563eb', '#3b82f6']} 
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
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Class Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter class name"
                value={className}
                onChangeText={setClassName}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Class Code (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter class code"
                value={classCode}
                onChangeText={setClassCode}
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
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
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
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <Plus size={20} color="#2563eb" />
            </View>
            <Text className="ml-3 text-gray-800 font-bold">Create New Class</Text>
          </TouchableOpacity>
        )}
        
        {/* Join Class Section */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3">Join a Class</Text>
          <Text className="text-gray-600 mb-4">Enter a join code to join a class</Text>
          
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-lg p-3 mr-2"
              placeholder="Enter join code"
              value={joinCodeInput}
              onChangeText={setJoinCodeInput}
            />
            <TouchableOpacity 
              className="bg-blue-600 py-3 px-5 rounded-lg"
              onPress={handleJoinClass}
            >
              <Text className="text-white font-bold">Join</Text>
            </TouchableOpacity>
          </View>
        </View>
        
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
          
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            renderItem={renderClassItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
                <QrCode size={20} color="#64748b" />
                <Text className="ml-2 text-gray-700 font-medium">Join Code: {selectedClass.joinCode}</Text>
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
                className="bg-blue-600 py-3 rounded-lg items-center"
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