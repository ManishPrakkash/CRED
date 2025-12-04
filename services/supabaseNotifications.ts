import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'request_correction';
  title: string;
  message: string;
  read: boolean;
  related_request_id: string | null;
  request_data: any;
  created_at: string;
}

export interface CreateNotificationParams {
  user_id: string;
  type: 'request_submitted' | 'request_approved' | 'request_rejected' | 'request_correction';
  title: string;
  message: string;
  related_request_id?: string;
  request_data?: any;
}

/**
 * Create a new notification
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    console.log('[createNotification] Creating notification:', params);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        related_request_id: params.related_request_id || null,
        request_data: params.request_data || null,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('[createNotification] Error:', error);
      return { success: false, message: error.message, notification: null };
    }

    console.log('[createNotification] Notification created successfully:', data.id);
    return { success: true, message: 'Notification created', notification: data };
  } catch (error: any) {
    console.error('[createNotification] Exception:', error);
    return { success: false, message: error.message || 'Failed to create notification', notification: null };
  }
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (userId: string) => {
  try {
    console.log('[getUserNotifications] Fetching notifications for user:', userId);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getUserNotifications] Error:', error);
      throw error;
    }

    console.log('[getUserNotifications] Found', data?.length || 0, 'notifications');
    return data as Notification[];
  } catch (error: any) {
    console.error('[getUserNotifications] Exception:', error);
    throw error;
  }
};

/**
 * Get unread notifications count for a user
 */
export const getUnreadCount = async (userId: string) => {
  try {
    console.log('[getUnreadCount] Fetching unread count for user:', userId);

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('[getUnreadCount] Error:', error);
      throw error;
    }

    console.log('[getUnreadCount] Unread count:', count);
    return count || 0;
  } catch (error: any) {
    console.error('[getUnreadCount] Exception:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string) => {
  try {
    console.log('[markAsRead] Marking notification as read:', notificationId);

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[markAsRead] Error:', error);
      return { success: false, message: error.message };
    }

    console.log('[markAsRead] Notification marked as read');
    return { success: true, message: 'Notification marked as read' };
  } catch (error: any) {
    console.error('[markAsRead] Exception:', error);
    return { success: false, message: error.message || 'Failed to mark notification as read' };
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string) => {
  try {
    console.log('[markAllAsRead] Marking all notifications as read for user:', userId);

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('[markAllAsRead] Error:', error);
      return { success: false, message: error.message };
    }

    console.log('[markAllAsRead] All notifications marked as read');
    return { success: true, message: 'All notifications marked as read' };
  } catch (error: any) {
    console.error('[markAllAsRead] Exception:', error);
    return { success: false, message: error.message || 'Failed to mark all notifications as read' };
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    console.log('[deleteNotification] Deleting notification:', notificationId);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('[deleteNotification] Error:', error);
      return { success: false, message: error.message };
    }

    console.log('[deleteNotification] Notification deleted');
    return { success: true, message: 'Notification deleted' };
  } catch (error: any) {
    console.error('[deleteNotification] Exception:', error);
    return { success: false, message: error.message || 'Failed to delete notification' };
  }
};

/**
 * Delete all read notifications for a user
 */
export const deleteReadNotifications = async (userId: string) => {
  try {
    console.log('[deleteReadNotifications] Deleting read notifications for user:', userId);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) {
      console.error('[deleteReadNotifications] Error:', error);
      return { success: false, message: error.message };
    }

    console.log('[deleteReadNotifications] Read notifications deleted');
    return { success: true, message: 'Read notifications deleted' };
  } catch (error: any) {
    console.error('[deleteReadNotifications] Exception:', error);
    return { success: false, message: error.message || 'Failed to delete read notifications' };
  }
};

/**
 * Subscribe to new notifications for a user (real-time)
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  console.log('[subscribeToNotifications] Setting up subscription for user:', userId);

  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[subscribeToNotifications] New notification received:', payload);
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return subscription;
};
