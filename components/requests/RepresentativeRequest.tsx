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
  const [workDescription, setWorkDescription] = useState('');
  const [requestedPoints, setRequestedPoints] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  
  const currentClass = user?.joinedClasses?.find(c => c.id === user?.currentClassId);

  // Mock data for staff work requests
  const allRequests = [
    {
      id: '1',
      workDescription: 'Conducted lab equipment maintenance and setup for Computer Networks practical',
      points: 50,
      date: '2023-06-15',
      time: '10:30 AM',
      status: 'pending',
      reviewedBy: null,
      attachments: [
        { id: '1', name: 'lab_before.jpg', uri: 'https://picsum.photos/400/300', type: 'image' as const, size: 245000 },
        { id: '2', name: 'lab_after.jpg', uri: 'https://picsum.photos/400/301', type: 'image' as const, size: 312000 },
      ],
    },
    {
      id: '2',
      workDescription: 'Organized student counseling session for final year students',
      points: 30,
      date: '2023-06-14',
      time: '09:15 AM',
      status: 'approved',
      reviewedBy: 'Dr. HOD',
      reviewDate: '2023-06-14',
    },
    {
      id: '3',
      workDescription: 'Conducted extra workshop on Machine Learning fundamentals',
      points: 40,
      date: '2023-06-13',
      time: '02:20 PM',
      status: 'approved',
      reviewedBy: 'Dr. HOD',
      reviewDate: '2023-06-13',
      attachments: [
        { id: '3', name: 'workshop_attendance.jpg', uri: 'https://picsum.photos/400/302', type: 'image' as const, size: 287000 },
      ],
    },
    {
      id: '4',
      workDescription: 'Late submission of monthly activity report',
      points: 10,
      date: '2023-06-12',
      time: '11:45 AM',
      status: 'rejected',
      reviewedBy: 'Dr. HOD',
      reviewDate: '2023-06-12',
      rejectionReason: 'Report submitted after deadline without prior notice',
    },
    {
      id: '5',
      workDescription: 'Mentored junior staff members on teaching methodologies',
      points: 25,
      date: '2023-06-11',
      time: '03:30 PM',
      status: 'pending',
      reviewedBy: null,
      attachments: [
        { id: '4', name: 'mentoring_report.pdf', uri: '', type: 'document' as const, size: 456000, mimeType: 'application/pdf' },
        { id: '5', name: 'session_photo.png', uri: 'https://picsum.photos/400/303', type: 'image' as const, size: 523000 },
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
    const matchesSearch = req.workDescription.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (!workDescription || !requestedPoints) {
      Alert.alert('Missing Information', 'Please provide work description and requested points');
      return;
    }
    Alert.alert(
      'Success',
      `Work request submitted: ${requestedPoints} points${attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''}\nYour request will be reviewed by the HOD.`
    );
    setWorkDescription('');
    setRequestedPoints('');
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
            <Text className="text-gray-500 text-xs mb-1">{item.date} • {item.time}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusColors.bg} border ${statusColors.border}`}>
            <Text className={`text-xs font-bold ${statusColors.text} capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className="px-3 py-2 rounded-lg bg-gray-50 mb-3">
          <Text className="text-gray-800 font-medium">{item.workDescription}</Text>
        </View>

        <View className="px-3 py-1 rounded-full self-start mb-2 bg-orange-50">
          <Text className="text-sm font-bold text-orange-700">
            {item.points} CredPoints
          </Text>
        </View>
        
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
          {item.reviewedBy && (
            <Text className="text-gray-500 text-xs mb-2">
              Reviewed by: {item.reviewedBy} {item.reviewDate && `on ${item.reviewDate}`}
            </Text>
          )}
          {item.status === 'rejected' && item.rejectionReason && (
            <View className="bg-red-50 rounded-lg p-2">
              <Text className="text-red-700 text-xs font-medium">Rejection Reason: {item.rejectionReason}</Text>
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
        colors={['#f59e0b', '#f97316']} 
        className="pt-12 pb-6 px-6 rounded-b-3xl"
      >
        <Text className="text-2xl font-bold text-white">Work Request</Text>
        <Text className="text-white/90 mt-1">Submit work evidence and track your requests</Text>
        {currentClass && (
          <View className="mt-3 bg-white/20 rounded-lg px-3 py-2">
            <Text className="text-white text-sm font-medium">{currentClass.className} • {currentClass.classCode}</Text>
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
              <Text className="font-bold text-gray-900">Submit New Work Request</Text>
              <Text className="text-gray-600 text-sm">Request CredPoints for your work</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit Form */}
        {showSubmitForm && (
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-orange-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">New Work Request</Text>
            
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

            {/* Attachments Section */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Evidence/Attachments (Recommended)
              </Text>
              <Text className="text-gray-500 text-xs mb-3">
                Upload photos, documents, or certificates as proof of work
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
                className="flex-1 bg-orange-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Submit to HOD</Text>
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
                    : 'No work requests yet. Submit your first work request to earn CredPoints!'}
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
