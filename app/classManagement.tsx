import BottomNav from '@/components/BottomNav';
import DeleteClassModal from '@/components/DeleteClassModal';
import { useClasses } from '@/contexts/ClassContext';
// import { mockStudents } from '@/services/mockData';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Check, Copy, Plus, Search, Trash2, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ClassManagementScreen = () => {
  const { classes, pendingRequests, createClass, approvePendingRequest, rejectPendingRequest, deleteClass, removeStudentFromClass, addStudentToClass } = useClasses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [className, setClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const handleCreateClass = () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    const newClass = createClass(className);
    
    // Automatically add 10 students to the new class
    // mockStudents.slice(0, 10).forEach(student => {
    //   addStudentToClass(newClass.id, student);
    // });
    
    setClassName('');
    setShowCreateForm(false);
    Alert.alert('Success', `Class created successfully!\n\nJoin Code: ${newClass.joinCode}`, [
      { text: 'OK' }
    ]);
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (!selectedClass) return;
    
    // First confirmation
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${studentName} from ${selectedClass.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              `This will permanently remove ${studentName} from the class. This action cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    removeStudentFromClass(selectedClass.id, studentId);
                    // Update the selected class to reflect changes
                    const updatedClass = classes.find(c => c.id === selectedClass.id);
                    if (updatedClass) {
                      setSelectedClass(updatedClass);
                    }
                    Alert.alert('Success', `${studentName} has been removed from the class`);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${text} copied to clipboard!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
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

  const handleDeleteClass = (classItem: any) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.name}"?\n\nThis will permanently remove:\n• ${classItem.studentCount} student${classItem.studentCount !== 1 ? 's' : ''} from this class\n• All class data and history\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setClassToDelete(classItem);
            setShowDeleteModal(true);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete.id);
      setShowDeleteModal(false);
      setClassToDelete(null);
      Alert.alert('Deleted', `"${classToDelete.name}" has been permanently deleted`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => setSelectedClass(item)}
          className="flex-row items-center flex-1"
        >
          <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
            <BookOpen size={24} color="#f59e0b" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
            <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-full mt-1 self-start">
              <Users size={12} color="#f59e0b" />
              <Text className="text-orange-700 ml-1 font-medium text-xs">{item.studentCount} Students</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleDeleteClass(item)}
          className="bg-red-50 p-2.5 rounded-lg ml-3"
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
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
      
      {/* Full Screen Class Details Modal */}
      <Modal
        visible={selectedClass !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setSelectedClass(null);
          setStudentSearchQuery('');
        }}
      >
        {selectedClass && (
          <View className="flex-1 bg-white">
            {/* Header */}
            <LinearGradient
              colors={['#f59e0b', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="pt-10 pb-3 px-4"
            >
              {/* Top Bar - Close Button Right */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold" numberOfLines={1}>{selectedClass.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Users size={12} color="#fff" />
                    <Text className="text-white/80 text-xs ml-1">{selectedClass.studentCount} Students</Text>
                    <Text className="text-white/60 text-xs mx-2">•</Text>
                    <Text className="text-white/80 text-xs">Avg: {selectedClass.students.length > 0 
                      ? Math.round(selectedClass.students.reduce((sum: number, s: any) => sum + (s.credPoints || 0), 0) / selectedClass.students.length)
                      : 0} pts</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedClass(null);
                    setStudentSearchQuery('');
                  }}
                  className="bg-white/20 rounded-lg p-2 ml-3"
                  activeOpacity={0.8}
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {/* Compact Join Code */}
              <View className="bg-white/10 rounded-lg px-3 py-2 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="text-white/70 text-xs mr-2">Code:</Text>
                  <Text className="text-white text-sm font-bold tracking-wider">{selectedClass.joinCode}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(selectedClass.joinCode)}
                  className="bg-white rounded-md px-3 py-1.5 flex-row items-center"
                  activeOpacity={0.8}
                >
                  <Copy size={14} color="#f59e0b" />
                  <Text className="text-orange-600 font-bold ml-1.5 text-xs">Copy</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Search Bar */}
            <View className="px-4 py-2.5 bg-white border-b border-gray-200">
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <Search size={16} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 text-sm"
                  placeholder="Search students..."
                  value={studentSearchQuery}
                  onChangeText={setStudentSearchQuery}
                  placeholderTextColor="#9ca3af"
                />
                {studentSearchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setStudentSearchQuery('')}
                    className="bg-gray-200 rounded-full p-1"
                  >
                    <X size={14} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Student List */}
            <FlatList
              data={selectedClass.students.filter((student: any) => 
                student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
              ListEmptyComponent={
                <View className="items-center py-16">
                  <View className="bg-gray-100 rounded-full p-6 mb-4">
                    <Users size={48} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-700 text-lg font-bold">
                    {studentSearchQuery ? 'No students found' : 'No students enrolled yet'}
                  </Text>
                  <Text className="text-gray-500 text-center mt-2 px-8 text-sm">
                    {studentSearchQuery 
                      ? 'Try a different search term'
                      : 'Share the join code for students to enroll'
                    }
                  </Text>
                </View>
              }
              renderItem={({ item: student, index }) => (
                <View className="mb-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <View className="flex-row items-center px-3 py-3">
                    {/* Rank Badge */}
                    <View className="bg-orange-500 rounded-lg w-8 h-8 items-center justify-center">
                      <Text className="text-white font-bold text-xs">{index + 1}</Text>
                    </View>
                    
                    {/* Avatar */}
                    <Image 
                      source={{ uri: student.avatar || 'https://i.pravatar.cc/150?img=1' }} 
                      className="w-11 h-11 rounded-full ml-3 border-2 border-gray-100"
                    />
                    
                    {/* Student Info */}
                    <View className="flex-1 ml-3 mr-2">
                      <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                        {student.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                        {student.email}
                      </Text>
                      {student.credPoints !== undefined && (
                        <View className="mt-1.5">
                          <View className="bg-orange-50 self-start rounded-md px-2 py-0.5 border border-orange-200">
                            <Text className="text-orange-600 text-xs font-bold">
                              {student.credPoints} points
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    
                    {/* Remove Button */}
                    <TouchableOpacity 
                      onPress={() => handleRemoveStudent(student.id, student.name)}
                      className="bg-red-50 rounded-lg p-2.5 border border-red-100"
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <DeleteClassModal
        visible={showDeleteModal}
        className={classToDelete?.name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      <BottomNav />
    </View>
  );
};

export default ClassManagementScreen;