import BottomNav from '@/components/BottomNav';
import DeleteClassModal from '@/components/DeleteClassModal';
import { useClasses } from '@/contexts/ClassContext';
import { getClassStaff } from '@/services/supabaseClasses';
// import { mockStudents } from '@/services/mockData';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BookOpen, Check, Copy, Plus, Search, Trash2, Users, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  joined_at: string;
}

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
  const [viewingClass, setViewingClass] = useState<{ id: string; name: string; code: string } | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Open delete modal only after classToDelete state is set
  useEffect(() => {
    if (classToDelete) {
      setShowDeleteModal(true);
    }
  }, [classToDelete]);

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

  const handleViewClassStaff = async (classId: string, className: string, classCode: string) => {
    console.log('Viewing class staff:', { classId, className, classCode });
    setViewingClass({ id: classId, name: className, code: classCode });
    setIsLoadingStaff(true);
    setStaffList([]);

    try {
      console.log('Fetching staff for class:', classId);
      const staff = await getClassStaff(classId);
      console.log('Staff data received:', staff);
      setStaffList(staff);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      Alert.alert('Error', error.message || 'Failed to load staff list');
      setViewingClass(null);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  };  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClassToDelete(null);
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => handleViewClassStaff(item.id, item.class_name, item.class_code)}
        >
          <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
            <BookOpen size={24} color="#10b981" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-800 text-lg">{item.class_name}</Text>
            <Text className="text-gray-500 text-sm">Code: {item.class_code}</Text>
            {item.department && (
              <Text className="text-gray-400 text-xs mt-0.5">{item.department}</Text>
            )}
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full mt-1 self-start">
              <Users size={12} color="#10b981" />
              <Text className="text-green-700 ml-1 font-medium text-xs">
                {item.current_enrollment || 0}
                {item.total_students > 0 ? `/${item.total_students}` : ''} Staff
              </Text>
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
      {viewingClass ? (
        // Staff List View
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={{ paddingBottom: 32 }}
          >
            <View style={{ paddingTop: 64, paddingBottom: 16, paddingHorizontal: 24 }}>
              <TouchableOpacity
                onPress={() => setViewingClass(null)}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              >
                <ArrowLeft size={24} color="white" />
                <Text style={{ color: 'white', marginLeft: 8, fontSize: 16 }}>Back to Classes</Text>
              </TouchableOpacity>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{viewingClass.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Code: {viewingClass.code}</Text>
                <View style={{
                  marginLeft: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12
                }}>
                  <Users size={14} color="white" />
                  <Text style={{ color: 'white', marginLeft: 4, fontWeight: '500', fontSize: 14 }}>
                    {staffList.length} Staff
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 16, marginTop: -24 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoadingStaff ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 48,
                alignItems: 'center',
                marginTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ color: '#6b7280', marginTop: 16, fontSize: 14 }}>Loading staff...</Text>
              </View>
            ) : staffList.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 48,
                alignItems: 'center',
                marginTop: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Users size={40} color="#9ca3af" />
                </View>
                <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>No Staff Enrolled</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 40 }}>
                  Staff members will appear here once they join this class using the class code
                </Text>
              </View>
            ) : (
              <View style={{ paddingTop: 8 }}>
                <View style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginBottom: 16
                }}>
                  <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>
                    ENROLLED MEMBERS
                  </Text>
                </View>
                {staffList.map((staff, index) => (
                  <View
                    key={staff.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 52,
                        height: 52,
                        backgroundColor: '#fed7aa',
                        borderRadius: 26,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: '#fdba74',
                      }}>
                        <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 22 }}>
                          {staff.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={{ color: '#111827', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                          {staff.name}
                        </Text>
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>
                          {staff.email}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                        <View style={{
                          backgroundColor: '#ffedd5',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          marginBottom: 6
                        }}>
                          <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>
                            JOINED
                          </Text>
                        </View>
                        <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '500' }}>
                          {formatJoinedDate(staff.joined_at)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <BottomNav />
        </View>
      ) : (
        // Original Class Management View
        <View className="flex-1">
          {/* Header */}
          <LinearGradient
            colors={['#10b981', '#059669']}
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
                    className="flex-1 bg-green-600 py-3 rounded-lg items-center"
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
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                  <Plus size={20} color="#10b981" />
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
      {showDeleteModal && classToDelete && (
        <DeleteClassModal
          visible={showDeleteModal}
          targetClassName={classToDelete.class_name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <BottomNav />
        </View>
      )}
    </View>
  );
};

export default ClassManagementScreen;
