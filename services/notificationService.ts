import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Notification } from '@/lib/types';

const NOTIFICATIONS_KEY_PREFIX = '@cred_notifications_';

export class NotificationService {
  // Add notification for a specific user
  static async addNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    try {
      const notificationsKey = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const existingData = await AsyncStorage.getItem(notificationsKey);
      const notifications: Notification[] = existingData ? JSON.parse(existingData) : [];

      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      notifications.unshift(newNotification);

      // Keep only last 50 notifications
      const trimmedNotifications = notifications.slice(0, 50);

      await AsyncStorage.setItem(notificationsKey, JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  }

  // Get all notifications for a user
  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsKey = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(notificationsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notificationsKey = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(notificationsKey);
      if (!data) return;

      const notifications: Notification[] = JSON.parse(data);
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(notificationsKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark notification as read by requestId
  static async markAsReadByRequestId(userId: string, requestId: string): Promise<void> {
    try {
      const notificationsKey = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(notificationsKey);
      if (!data) return;

      const notifications: Notification[] = JSON.parse(data);
      const updated = notifications.map(n =>
        n.requestId === requestId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(notificationsKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark notification as read by requestId:', error);
    }
  }

  // Helper: Notify advisor about new staff request
  static async notifyAdvisorOfRequest(
    advisorId: string,
    staffId: string,
    staffName: string,
    requestId: string,
    workDescription: string,
    requestData?: any
  ): Promise<void> {
    await this.addNotification(advisorId, {
      type: 'request_submitted',
      title: 'New Work Request',
      message: `${staffName} has submitted a new work request: ${workDescription.substring(0, 60)}${workDescription.length > 60 ? '...' : ''}`,
      requestId,
      fromUserId: staffId,
      fromUserName: staffName,
      read: false,
      requestData,
    });
  }

  // Helper: Notify staff about request approval
  static async notifyStaffOfApproval(
    staffId: string,
    advisorId: string,
    advisorName: string,
    requestId: string,
    workDescription: string,
    points: number
  ): Promise<void> {
    await this.addNotification(staffId, {
      type: 'request_approved',
      title: 'Request Approved',
      message: `Your work request "${workDescription.substring(0, 50)}${workDescription.length > 50 ? '...' : ''}" has been approved for ${points} points!`,
      requestId,
      fromUserId: advisorId,
      fromUserName: advisorName,
      read: false,
    });
  }

  // Helper: Notify staff about request rejection
  static async notifyStaffOfRejection(
    staffId: string,
    advisorId: string,
    advisorName: string,
    requestId: string,
    workDescription: string,
    reason?: string
  ): Promise<void> {
    await this.addNotification(staffId, {
      type: 'request_rejected',
      title: 'Request Rejected',
      message: `Your work request "${workDescription.substring(0, 50)}${workDescription.length > 50 ? '...' : ''}" was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      requestId,
      fromUserId: advisorId,
      fromUserName: advisorName,
      read: false,
    });
  }

  // Helper: Notify staff about correction request
  static async notifyStaffOfCorrection(
    staffId: string,
    advisorId: string,
    advisorName: string,
    requestId: string,
    workDescription: string,
    correctionDetails: string
  ): Promise<void> {
    await this.addNotification(staffId, {
      type: 'request_correction',
      title: 'Correction Requested',
      message: `Your work request "${workDescription.substring(0, 50)}${workDescription.length > 50 ? '...' : ''}" needs corrections: ${correctionDetails}`,
      requestId,
      fromUserId: advisorId,
      fromUserName: advisorName,
      read: false,
    });
  }

  // Clear all notifications for a user
  static async clearAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsKey = `${NOTIFICATIONS_KEY_PREFIX}${userId}`;
      await AsyncStorage.setItem(notificationsKey, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}
