import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Bell, CheckCircle, XCircle, FileText, Check, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function Notifications() {
  const router = useRouter();
  const { user, markNotificationAsRead } = useAuth();

  // Redirect staff without active class to joinClass page
  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'staff' && !user?.currentClassId) {
        router.replace('/joinClass');
      }
    }, [user?.role, user?.currentClassId, router])
  );

  // Show all notifications (both read and unread)
  const notifications = user?.notifications || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_submitted':
        return <FileText size={20} color="#f59e0b" />;
      case 'request_approved':
        return <CheckCircle size={20} color="#10b981" />;
      case 'request_rejected':
        return <XCircle size={20} color="#ef4444" />;
      case 'request_correction':
        return <Bell size={20} color="#3b82f6" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'request_submitted':
        return 'bg-orange-50 border-orange-200';
      case 'request_approved':
        return 'bg-green-50 border-green-200';
      case 'request_rejected':
        return 'bg-red-50 border-red-200';
      case 'request_correction':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationPress = (notification: any) => {
    // Don't navigate anywhere - just view the notification
    // Notifications are read-only for viewing
  };

  const handleMarkAsRead = (notificationId: string, event: any) => {
    event.stopPropagation();
    markNotificationAsRead(notificationId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={user?.role === 'staff' ? ['#f59e0b', '#f97316'] : ['#10b981', '#059669']}
        className="px-6 pt-12 pb-6 rounded-b-3xl"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/20 rounded-lg"
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Notifications</Text>
            <Text className="text-white/80 text-sm mt-1">
              {notifications.filter(n => !n.read).length} unread
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Bell size={40} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-lg font-semibold">No notifications</Text>
            <Text className="text-gray-400 text-sm mt-2">You're all caught up!</Text>
          </View>
        ) : (
          <View className="gap-3">
            {notifications.map((notification) => (
              <View
                key={notification.id}
                className={`bg-white rounded-xl p-4 border ${
                  !notification.read ? 'border-l-4' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <View className="flex-row items-start gap-3">
                  <View className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className={`text-gray-900 font-semibold flex-1 ${
                        !notification.read ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-orange-500 rounded-full ml-2" />
                      )}
                    </View>
                    
                    <Text className="text-gray-600 text-sm leading-5 mb-2">
                      {notification.message}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Text className="text-gray-400 text-xs">
                          {formatTime(notification.createdAt)}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          from {notification.fromUserName}
                        </Text>
                      </View>
                      
                      {!notification.read && (
                        <TouchableOpacity
                          onPress={(e) => handleMarkAsRead(notification.id, e)}
                          className="border border-green-500 bg-green-50 px-2.5 py-1 rounded-md flex-row items-center justify-center gap-1"
                          activeOpacity={0.7}
                        >
                          <Check size={12} color="#10b981" strokeWidth={2.5} />
                          <Text className="text-green-700 text-[10px] font-semibold" style={{ marginTop: -1 }}>Done</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
