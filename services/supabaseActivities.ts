import { supabase } from '@/lib/supabase';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: 'credit' | 'debit' | 'request_approved' | 'request_rejected' | 'request_correction';
  description: string;
  points: number;
  related_request_id: string | null;
  created_at: string;
}

export interface CreateActivityParams {
  user_id: string;
  activity_type: 'credit' | 'debit' | 'request_approved' | 'request_rejected' | 'request_correction';
  description: string;
  points: number;
  related_request_id?: string;
}

/**
 * Create a new activity log entry
 */
export const createActivity = async (params: CreateActivityParams) => {
  try {
    console.log('[createActivity] Creating activity:', params);

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: params.user_id,
        activity_type: params.activity_type,
        description: params.description,
        points: params.points,
        related_request_id: params.related_request_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('[createActivity] Error:', error);
      return { success: false, message: error.message, activity: null };
    }

    console.log('[createActivity] Activity created successfully:', data.id);
    return { success: true, message: 'Activity logged', activity: data };
  } catch (error: any) {
    console.error('[createActivity] Exception:', error);
    return { success: false, message: error.message || 'Failed to create activity', activity: null };
  }
};

/**
 * Get all activities for a user
 */
export const getUserActivities = async (userId: string, limit: number = 50) => {
  try {
    console.log('[getUserActivities] Fetching activities for user:', userId);

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getUserActivities] Error:', error);
      throw error;
    }

    console.log('[getUserActivities] Found', data?.length || 0, 'activities');
    return data as Activity[];
  } catch (error: any) {
    console.error('[getUserActivities] Exception:', error);
    throw error;
  }
};

/**
 * Get activities for a specific request
 */
export const getRequestActivities = async (requestId: string) => {
  try {
    console.log('[getRequestActivities] Fetching activities for request:', requestId);

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('related_request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getRequestActivities] Error:', error);
      throw error;
    }

    console.log('[getRequestActivities] Found', data?.length || 0, 'activities');
    return data as Activity[];
  } catch (error: any) {
    console.error('[getRequestActivities] Exception:', error);
    throw error;
  }
};

/**
 * Get recent activities across all users (for admin/advisor view)
 */
export const getRecentActivities = async (limit: number = 100) => {
  try {
    console.log('[getRecentActivities] Fetching recent activities');

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email,
          employee_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getRecentActivities] Error:', error);
      throw error;
    }

    console.log('[getRecentActivities] Found', data?.length || 0, 'activities');
    return data;
  } catch (error: any) {
    console.error('[getRecentActivities] Exception:', error);
    throw error;
  }
};

/**
 * Delete old activities (cleanup)
 */
export const deleteOldActivities = async (daysOld: number = 90) => {
  try {
    console.log('[deleteOldActivities] Deleting activities older than', daysOld, 'days');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('activities')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('[deleteOldActivities] Error:', error);
      return { success: false, message: error.message };
    }

    console.log('[deleteOldActivities] Old activities deleted successfully');
    return { success: true, message: 'Old activities deleted' };
  } catch (error: any) {
    console.error('[deleteOldActivities] Exception:', error);
    return { success: false, message: error.message || 'Failed to delete old activities' };
  }
};
