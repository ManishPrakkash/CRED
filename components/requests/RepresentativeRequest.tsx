import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Plus, Search, User, Paperclip, Image as ImageIcon, X, File, Eye } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '@/lib/types';

export default function RepresentativeRequest() {
  const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [requestType, setRequestType] = useState<'add' | 'subtract'>('add');
  const [studentId, setStudentId] = useState('');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

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
      attachments: [
        { id: '1', name: 'presentation_screenshot.png', uri: 'https://picsum.photos/400/300', type: 'image' as const, size: 245000 },
        { id: '2', name: 'attendance_sheet.pdf', uri: '', type: 'document' as const, size: 128000, mimeType: 'application/pdf' },
      ],
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
      attachments: [
        { id: '3', name: 'collaboration_photo.jpg', uri: 'https://picsum.photos/400/301', type: 'image' as const, size: 312000 },
      ],
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
      attachments: [
        { id: '4', name: 'project_certificate.pdf', uri: '', type: 'document' as const, size: 456000, mimeType: 'application/pdf' },
        { id: '5', name: 'team_photo.png', uri: 'https://picsum.photos/400/302', type: 'image' as const, size: 523000 },
      ],
    },
  ];

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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          uri: file.uri,
          type: 'document',
          size: file.size,
          mimeType: file.mimeType,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: `image_${Date.now()}.jpg`,
          uri: image.uri,
          type: 'image',
          size: image.fileSize,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: `photo_${Date.now()}.jpg`,
          uri: photo.uri,
          type: 'image',
          size: photo.fileSize,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredRequests = allRequests.filter(req => {
    const matchesSearch = req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    
    // Date filtering logic
    let matchesDate = true;
    if (selectedDate) {
      const requestDate = new Date(req.date);
      const filterDate = new Date(selectedDate);
      // Compare only year, month, and day
      matchesDate = requestDate.getFullYear() === filterDate.getFullYear() &&
                    requestDate.getMonth() === filterDate.getMonth() &&
                    requestDate.getDate() === filterDate.getDate();
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const handleSubmitRequest = () => {
    if (!studentId || !points || !reason) {
      Alert.alert('Missing Information', 'Please fill all required fields');
      return;
    }
    Alert.alert(
      'Success',
      `Request submitted for ${studentId}: ${requestType === 'add' ? '+' : '-'}${points} points${attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''}`
    );
    setStudentId('');
    setPoints('');
    setReason('');
    setAttachments([]);
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
        
        {/* Attachments Preview */}
        {item.attachments && item.attachments.length > 0 && (
          <View className="mb-3">
            <Text className="text-gray-600 text-xs font-medium mb-2">
              <Paperclip size={12} color="#64748b" /> {item.attachments.length} Attachment(s)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {item.attachments.map((attachment: Attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    onPress={() => attachment.type === 'image' && attachment.uri ? setPreviewAttachment(attachment) : null}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                    style={{ width: 100 }}
                  >
                    {attachment.type === 'image' && attachment.uri ? (
                      <Image source={{ uri: attachment.uri }} className="w-full h-20" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-20 items-center justify-center">
                        <File size={24} color="#64748b" />
                      </View>
                    )}
                    <View className="p-2">
                      <Text className="text-gray-700 text-xs font-medium" numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        
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

            {/* Attachments Section */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Attachments (Optional)
              </Text>
              
              {/* Attachment Buttons */}
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-3 items-center"
                >
                  <ImageIcon size={20} color="#3b82f6" />
                  <Text className="text-blue-600 text-xs mt-1 font-medium">Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className="flex-1 bg-purple-50 border border-purple-200 rounded-lg py-3 items-center"
                >
                  <ImageIcon size={20} color="#9333ea" />
                  <Text className="text-purple-600 text-xs mt-1 font-medium">Camera</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handlePickDocument}
                  className="flex-1 bg-orange-50 border border-orange-200 rounded-lg py-3 items-center"
                >
                  <Paperclip size={20} color="#f97316" />
                  <Text className="text-orange-600 text-xs mt-1 font-medium">Document</Text>
                </TouchableOpacity>
              </View>

              {/* Attached Files List */}
              {attachments.length > 0 && (
                <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <Text className="text-gray-600 text-xs font-medium mb-2">
                    {attachments.length} file(s) attached
                  </Text>
                  {attachments.map((attachment) => (
                    <View key={attachment.id} className="flex-row items-center bg-white rounded-lg p-2 mb-2 border border-gray-200">
                      <View className="w-10 h-10 rounded bg-gray-100 items-center justify-center mr-2">
                        {attachment.type === 'image' ? (
                          attachment.uri ? (
                            <Image source={{ uri: attachment.uri }} className="w-10 h-10 rounded" />
                          ) : (
                            <ImageIcon size={20} color="#64748b" />
                          )
                        ) : (
                          <File size={20} color="#64748b" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 text-sm font-medium" numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {formatFileSize(attachment.size)}
                        </Text>
                      </View>
                      {attachment.type === 'image' && attachment.uri && (
                        <TouchableOpacity
                          onPress={() => setPreviewAttachment(attachment)}
                          className="mr-2 p-1"
                        >
                          <Eye size={18} color="#10b981" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => removeAttachment(attachment.id)}
                        className="p-1"
                      >
                        <X size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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

        {/* Active Date Filter Display */}
        {selectedDate && (
          <View className="bg-green-50 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between border border-green-200">
            <Text className="text-green-800 text-sm flex-1">
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
                      <Text className="text-green-600 font-bold">Done</Text>
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

      {/* Image Preview Modal */}
      <Modal
        visible={previewAttachment !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewAttachment(null)}
      >
        <View className="flex-1 bg-black/90">
          <TouchableOpacity
            onPress={() => setPreviewAttachment(null)}
            className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
          
          {previewAttachment && previewAttachment.type === 'image' && previewAttachment.uri && (
            <View className="flex-1 items-center justify-center p-6">
              <Image 
                source={{ uri: previewAttachment.uri }} 
                className="w-full h-full"
                resizeMode="contain"
              />
              <View className="absolute bottom-8 left-6 right-6 bg-black/60 rounded-lg p-4">
                <Text className="text-white font-bold mb-1">{previewAttachment.name}</Text>
                <Text className="text-white/80 text-sm">{formatFileSize(previewAttachment.size)}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}
