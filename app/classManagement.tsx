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
  const { classes, loading, createClass, deleteClass } = useClasses();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  const handleCreateClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }
    
    if (!classCode.trim()) {
      Alert.alert('Error', 'Please enter a class code');
      return;
    }

    const result = await createClass({
      class_name: className.trim(),
      class_code: classCode.trim().toUpperCase(),
      department: department.trim() || undefined,
      semester: semester.trim() || undefined,
      academic_year: academicYear.trim() || undefined,
      total_students: maxCapacity.trim() ? parseInt(maxCapacity.trim()) : undefined,
    });
    
    if (result.success) {
      setClassName('');
      setClassCode('');
      setDepartment('');
      setSemester('');
      setAcademicYear('');
      setMaxCapacity('');
      setShowCreateForm(false);
      Alert.alert('Success', `Class created successfully!\n\nClass Code: ${result.class?.class_code}`, [
        { text: 'OK' }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  // TODO: Remove - no students in this project
  // const handleRemoveStudent = (studentId: string, studentName: string) => {
  //   if (!selectedClass) return;
  //   
  //   // First confirmation
  //   Alert.alert(
  //     'Remove Student',
  //     `Are you sure you want to remove ${studentName} from ${selectedClass.name}?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Continue',
  //         style: 'destructive',
  //         onPress: () => {
  //           // Second confirmation
  //           Alert.alert(
  //             'Final Confirmation',
  //             `This will permanently remove ${studentName} from the class. This action cannot be undone.`,
  //             [
  //               { text: 'Cancel', style: 'cancel' },
  //               {
  //                 text: 'Remove',
  //                 style: 'destructive',
  //                 onPress: () => {
  //                   removeStudentFromClass(selectedClass.id, studentId);
  //                   // Update the selected class to reflect changes
  //                   const updatedClass = classes.find(c => c.id === selectedClass.id);
  //                   if (updatedClass) {
  //                     setSelectedClass(updatedClass);
  //                   }
  //                   Alert.alert('Success', `${studentName} has been removed from the class`);
  //                 }
  //               }
  //             ]
  //           );
  //         }
  //       }
  //     ]
  //   );
  // };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', `${text} copied to clipboard!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  // TODO: Remove - no student join requests in this project
  // const handleApproveStudent = (requestId: string, classId: string) => {
  //   approvePendingRequest(requestId, classId);
  //   const request = pendingRequests.find(r => r.id === requestId);
  //   if (request) {
  //     Alert.alert('Success', `${request.studentName} has been added to the class`);
  //   }
  // };

  // const handleRejectStudent = (requestId: string) => {
  //   rejectPendingRequest(requestId);
  //   Alert.alert('Success', 'Student request rejected');
  // };

  const handleDeleteClass = (classItem: any) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.class_name}"?\n\nThis will permanently remove:\n• All class data and history\n• All related work requests\n\nThis action cannot be undone.`,
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

  const confirmDelete = async () => {
    if (classToDelete) {
      const result = await deleteClass(classToDelete.id);
      setShowDeleteModal(false);
      setClassToDelete(null);
      
      if (result.success) {
        Alert.alert('Deleted', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
            <BookOpen size={24} color="#f59e0b" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800 text-lg">{item.class_name}</Text>
            <Text className="text-gray-500 text-sm">Code: {item.class_code}</Text>
            {item.department && (
              <Text className="text-gray-400 text-xs mt-0.5">{item.department}</Text>
            )}
            <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-full mt-1 self-start">
              <Users size={12} color="#f59e0b" />
              <Text className="text-orange-700 ml-1 font-medium text-xs">
                {item.current_enrollment || 0}
                {item.total_students > 0 ? `/${item.total_students}` : ''} Staff
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteClass(item)}
          className="bg-red-50 p-2.5 rounded-lg ml-3"
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // TODO: Remove - no students in this project
  // const renderStudentItem = ({ item }: { item: any }) => (
  //   <View className="flex-row items-center py-3 border-b border-gray-100">
  //     <Image 
  //       source={{ uri: item.avatar }} 
  //       className="w-10 h-10 rounded-full"
  //     />
  //     <Text className="ml-3 text-gray-800 font-medium">{item.name}</Text>
  //   </View>
  // );

  // TODO: Remove - no student join requests in this project
  // const renderPendingRequest = ({ item }: { item: any }) => {
  //   const classItem = classes.find(cls => cls.id === item.classId);
  //   return (
  //     <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
  //       <View className="flex-row items-center mb-3">
  //         {item.avatar && (
  //           <Image 
  //             source={{ uri: item.avatar }} 
  //             className="w-12 h-12 rounded-full"
  //           />
  //         )}
  //         {!item.avatar && (
  //           <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
  //             <Users size={20} color="#f59e0b" />
  //           </View>
  //         )}
  //         <View className="ml-3 flex-1">
  //           <Text className="font-bold text-gray-800">{item.studentName}</Text>
  //           <Text className="text-gray-500 text-sm">Request to join {classItem?.name || 'class'}</Text>
  //         </View>
  //       </View>
  //       
  //       <View className="flex-row gap-2 mt-2">
  //         <TouchableOpacity 
  //           className="flex-1 bg-red-50 border border-red-200 py-2.5 rounded-lg flex-row items-center justify-center"
  //           onPress={() => handleRejectStudent(item.id)}
  //         >
  //           <X size={18} color="#ef4444" />
  //           <Text className="text-red-700 font-medium ml-1">Reject</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity 
  //           className="flex-1 bg-green-50 border border-green-200 py-2.5 rounded-lg flex-row items-center justify-center"
  //           onPress={() => handleApproveStudent(item.id, item.classId)}
  //         >
  //           <Check size={18} color="#10b981" />
  //           <Text className="text-green-700 font-medium ml-1">Approve</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

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
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Class Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., Advanced Programming"
                value={className}
                onChangeText={setClassName}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Class Code *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., CS301"
                value={classCode}
                onChangeText={setClassCode}
                autoCapitalize="characters"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Department (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., Computer Science"
                value={department}
                onChangeText={setDepartment}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Semester (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., Fall 2024"
                value={semester}
                onChangeText={setSemester}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Academic Year (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., 2024-2025"
                value={academicYear}
                onChangeText={setAcademicYear}
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Maximum Capacity (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="e.g., 50"
                value={maxCapacity}
                onChangeText={setMaxCapacity}
                keyboardType="numeric"
              />
              <Text className="text-gray-500 text-xs mt-1">Leave empty for unlimited capacity</Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center mr-2"
                onPress={() => {
                  setShowCreateForm(false);
                  setClassName('');
                  setClassCode('');
                  setDepartment('');
                  setSemester('');
                  setAcademicYear('');
                  setMaxCapacity('');
                }}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-orange-600 py-3 rounded-lg items-center"
                onPress={handleCreateClass}
                disabled={loading}
              >
                <Text className="text-white font-bold">
                  {loading ? 'Creating...' : 'Create Class'}
                </Text>
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
                Create your first class to start managing work requests and tracking CRED points
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Delete Confirmation Modal */}
      <DeleteClassModal
        visible={showDeleteModal}
        className={classToDelete?.class_name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
      <BottomNav />
    </View>
  );
};

export default ClassManagementScreen;
