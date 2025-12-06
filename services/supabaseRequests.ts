import { supabase } from '@/lib/supabase';
import { createNotification } from './supabaseNotifications';
import { createActivity } from './supabaseActivities';

export interface CreateRequestParams {
  staff_id: string;
  advisor_id: string;
  class_id?: string;
  work_description: string;
  requested_points: number;
}

export interface RequestFilters {
  staff_id?: string;
  advisor_id?: string;
  class_id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'correction';
  date_from?: string;
  date_to?: string;
}

export interface UpdateRequestParams {
  status: 'approved' | 'rejected' | 'correction';
  response_message?: string;
  approved_points?: number;
}

export interface Request {
  id: string;
  staff_id: string;
  advisor_id: string;
  class_id: string | null;
  work_description: string;
  requested_points: number;
  status: 'pending' | 'approved' | 'rejected' | 'correction';
  response_message: string | null;
  approved_points: number | null;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
}

/**
 * Create a new work request
 */
export const createRequest = async (params: CreateRequestParams) => {
  try {
    console.log('[createRequest] Creating request:', params);

    const { data, error } = await supabase
      .from('requests')
      .insert({
        staff_id: params.staff_id,
        advisor_id: params.advisor_id,
        class_id: params.class_id || null,
        work_description: params.work_description,
        requested_points: params.requested_points,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('[createRequest] Error:', error);
      return { success: false, message: error.message, request: null };
    }

    console.log('[createRequest] Request created successfully:', data.id);
    return { success: true, message: 'Request submitted successfully', request: data };
  } catch (error: any) {
    console.error('[createRequest] Exception:', error);
    return { success: false, message: error.message || 'Failed to create request', request: null };
  }
};

/**
 * Get all requests for a staff member
 */
export const getStaffRequests = async (staffId: string) => {
  try {
    console.log('[getStaffRequests] Fetching requests for staff:', staffId);

    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getStaffRequests] Error:', error);
      throw error;
    }

    console.log('[getStaffRequests] Found', data?.length || 0, 'requests');
    return data as Request[];
  } catch (error: any) {
    console.error('[getStaffRequests] Exception:', error);
    throw error;
  }
};

/**
 * Get all pending requests for an advisor
 */
export const getAdvisorPendingRequests = async (advisorId: string) => {
  try {
    console.log('[getAdvisorPendingRequests] Fetching pending requests for advisor:', advisorId);

    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          email,
          employee_id
        )
      `)
      .eq('advisor_id', advisorId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAdvisorPendingRequests] Error:', error);
      throw error;
    }

    console.log('[getAdvisorPendingRequests] Found', data?.length || 0, 'pending requests');
    return data;
  } catch (error: any) {
    console.error('[getAdvisorPendingRequests] Exception:', error);
    throw error;
  }
};

/**
 * Get all requests for an advisor (all statuses)
 */
export const getAdvisorRequests = async (advisorId: string) => {
  try {
    console.log('[getAdvisorRequests] Fetching all requests for advisor:', advisorId);

    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          email,
          employee_id
        )
      `)
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAdvisorRequests] Error:', error);
      throw error;
    }

    console.log('[getAdvisorRequests] Found', data?.length || 0, 'requests');
    return data;
  } catch (error: any) {
    console.error('[getAdvisorRequests] Exception:', error);
    throw error;
  }
};

/**
 * Update request status (approve/reject/correction)
 * Also creates notifications and activity logs
 */
export const updateRequestStatus = async (requestId: string, params: UpdateRequestParams) => {
  try {
    console.log('[updateRequestStatus] Updating request:', requestId, params);

    const updateData: any = {
      status: params.status,
      response_message: params.response_message || null,
      responded_at: new Date().toISOString()
    };

    if (params.status === 'approved' && params.approved_points !== undefined) {
      updateData.approved_points = params.approved_points;
    }

    const { data, error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('[updateRequestStatus] Error:', error);
      return { success: false, message: error.message, request: null };
    }

    // Create notification for staff member
    const notificationType = 
      params.status === 'approved' ? 'request_approved' :
      params.status === 'rejected' ? 'request_rejected' :
      'request_correction';

    const notificationTitle = 
      params.status === 'approved' ? 'Request Approved' :
      params.status === 'rejected' ? 'Request Rejected' :
      'Request Needs Correction';

    const notificationMessage = 
      params.status === 'approved' 
        ? `Your request has been approved! You received ${params.approved_points || data.requested_points} CRED points.`
        : params.status === 'rejected'
        ? `Your request has been rejected. ${params.response_message || ''}`
        : `Your request needs correction. ${params.response_message || ''}`;

    await createNotification({
      user_id: data.staff_id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      related_request_id: requestId,
      request_data: {
        work_description: data.work_description,
        requested_points: data.requested_points,
        approved_points: params.approved_points,
        response_message: params.response_message
      }
    });

    // Create activity log based on status
    if (params.status === 'rejected') {
      // Activity: request_rejected
      await createActivity({
        user_id: data.staff_id,
        activity_type: 'request_rejected',
        description: `Request rejected: ${data.work_description.substring(0, 100)}${data.work_description.length > 100 ? '...' : ''}`,
        points: 0,
        related_request_id: requestId
      });
    } else if (params.status === 'correction') {
      // Activity: request_correction
      await createActivity({
        user_id: data.staff_id,
        activity_type: 'request_correction',
        description: `Correction requested: ${data.work_description.substring(0, 100)}${data.work_description.length > 100 ? '...' : ''}`,
        points: 0,
        related_request_id: requestId
      });
    }
    // Note: For 'approved' status, activity is created in updateStaffCredPoints as credit/debit

    console.log('[updateRequestStatus] Request updated successfully');
    return { success: true, message: 'Request updated successfully', request: data };
  } catch (error: any) {
    console.error('[updateRequestStatus] Exception:', error);
    return { success: false, message: error.message || 'Failed to update request', request: null };
  }
};

/**
 * Update staff CRED points after approval
 * Also creates an activity log for credit/debit
 */
export const updateStaffCredPoints = async (
  staffId: string, 
  pointsToAdd: number, 
  requestId?: string, 
  workDescription?: string,
  requestedPoints?: number
) => {
  try {
    console.log('[updateStaffCredPoints] Updating CRED points for staff:', staffId, 'Points:', pointsToAdd);

    // Get current points
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('cred_points')
      .eq('id', staffId)
      .single();

    if (fetchError) {
      console.error('[updateStaffCredPoints] Fetch error:', fetchError);
      return { success: false, message: fetchError.message };
    }

    const currentPoints = userData?.cred_points || 0;
    const newPoints = currentPoints + pointsToAdd;

    // Update points
    const { error: updateError } = await supabase
      .from('users')
      .update({ cred_points: newPoints })
      .eq('id', staffId);

    if (updateError) {
      console.error('[updateStaffCredPoints] Update error:', updateError);
      return { success: false, message: updateError.message };
    }

    // Create activity log: credit (points added) or debit (points reduced)
    const activityType = pointsToAdd >= 0 ? 'credit' : 'debit';
    const absPoints = Math.abs(pointsToAdd);
    const actionText = pointsToAdd >= 0 ? 'Earned' : 'Deducted';
    
    // Build description with adjustment info if points differ
    let activityDescription = '';
    if (workDescription) {
      const shortDesc = workDescription.substring(0, 80) + (workDescription.length > 80 ? '...' : '');
      if (requestedPoints !== undefined && absPoints !== Math.abs(requestedPoints)) {
        // Points were adjusted
        activityDescription = `${actionText} ${absPoints} points (requested ${Math.abs(requestedPoints)}) for: ${shortDesc}`;
      } else {
        // Points approved as requested
        activityDescription = `${actionText} ${absPoints} points for: ${shortDesc}`;
      }
    } else {
      activityDescription = `${actionText} ${absPoints} CRED points`;
    }

    await createActivity({
      user_id: staffId,
      activity_type: activityType,
      description: activityDescription,
      points: absPoints,
      related_request_id: requestId
    });

    console.log('[updateStaffCredPoints] Points updated successfully:', currentPoints, '->', newPoints);
    return { success: true, message: 'CRED points updated', newPoints };
  } catch (error: any) {
    console.error('[updateStaffCredPoints] Exception:', error);
    return { success: false, message: error.message || 'Failed to update CRED points' };
  }
};

/**
 * Get request by ID
 */
export const getRequestById = async (requestId: string) => {
  try {
    console.log('[getRequestById] Fetching request:', requestId);

    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          email,
          employee_id
        ),
        advisor:advisor_id (
          id,
          name,
          email
        )
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('[getRequestById] Error:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('[getRequestById] Exception:', error);
    throw error;
  }
};

/**
 * Approve a request - Complete flow with points update, notification, and activity
 */
export const approveRequest = async (
  requestId: string,
  approvedPoints: number,
  responseMessage?: string
) => {
  try {
    console.log('[approveRequest] Approving request:', requestId, 'Points:', approvedPoints);

    // Get request details
    const request = await getRequestById(requestId);
    if (!request) {
      return { success: false, message: 'Request not found' };
    }

    // Update request status (creates notification, but NOT activity for approved)
    const updateResult = await updateRequestStatus(requestId, {
      status: 'approved',
      approved_points: approvedPoints,
      response_message: responseMessage
    });

    if (!updateResult.success) {
      return updateResult;
    }

    // Update staff CRED points (creates credit/debit activity)
    const pointsResult = await updateStaffCredPoints(
      request.staff_id,
      approvedPoints,
      requestId,
      request.work_description,
      request.requested_points
    );

    if (!pointsResult.success) {
      console.error('[approveRequest] Failed to update points, but request was approved');
    }

    console.log('[approveRequest] Request approved successfully');
    return { 
      success: true, 
      message: 'Request approved and points awarded',
      newPoints: pointsResult.newPoints 
    };
  } catch (error: any) {
    console.error('[approveRequest] Exception:', error);
    return { success: false, message: error.message || 'Failed to approve request' };
  }
};

/**
 * Reject a request - Complete flow with notification and activity
 */
export const rejectRequest = async (
  requestId: string,
  rejectionReason?: string
) => {
  try {
    console.log('[rejectRequest] Rejecting request:', requestId);

    // Update request status
    const updateResult = await updateRequestStatus(requestId, {
      status: 'rejected',
      response_message: rejectionReason
    });

    if (!updateResult.success) {
      return updateResult;
    }

    console.log('[rejectRequest] Request rejected successfully');
    return { success: true, message: 'Request rejected' };
  } catch (error: any) {
    console.error('[rejectRequest] Exception:', error);
    return { success: false, message: error.message || 'Failed to reject request' };
  }
};

/**
 * Request correction - Send request back to staff for changes
 */
export const requestCorrection = async (
  requestId: string,
  correctionNote: string
) => {
  try {
    console.log('[requestCorrection] Requesting correction for:', requestId);

    // Update request status
    const updateResult = await updateRequestStatus(requestId, {
      status: 'correction',
      response_message: correctionNote
    });

    if (!updateResult.success) {
      return updateResult;
    }

    console.log('[requestCorrection] Correction requested successfully');
    return { success: true, message: 'Correction requested' };
  } catch (error: any) {
    console.error('[requestCorrection] Exception:', error);
    return { success: false, message: error.message || 'Failed to request correction' };
  }
};

/**
 * Update and resubmit a correction request
 */
export const updateAndResubmitRequest = async (
  requestId: string,
  workDescription: string,
  requestedPoints: number
) => {
  try {
    console.log('[updateAndResubmitRequest] Updating request:', requestId);

    const { data, error } = await supabase
      .from('requests')
      .update({
        work_description: workDescription,
        requested_points: requestedPoints,
        status: 'pending',
        response_message: null,
        responded_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('[updateAndResubmitRequest] Error:', error);
      return { success: false, message: error.message, request: null };
    }

    // Create notification for advisor about resubmission
    await createNotification({
      user_id: data.advisor_id,
      type: 'request_submitted',
      title: 'Request Resubmitted',
      message: `A corrected request has been resubmitted for ${requestedPoints} CRED points`,
      related_request_id: requestId,
      request_data: {
        staff_id: data.staff_id,
        work_description: workDescription,
        requested_points: requestedPoints,
        is_resubmission: true
      }
    });

    console.log('[updateAndResubmitRequest] Request updated and resubmitted successfully');
    return { success: true, message: 'Request updated and resubmitted', request: data };
  } catch (error: any) {
    console.error('[updateAndResubmitRequest] Exception:', error);
    return { success: false, message: error.message || 'Failed to update request', request: null };
  }
};

/**
 * Get requests with filtering
 */
export const getRequests = async (filters?: RequestFilters) => {
  try {
    console.log('[getRequests] Fetching requests with filters:', filters);

    let query = supabase
      .from('requests')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          email,
          employee_id
        ),
        advisor:advisor_id (
          id,
          name,
          email
        ),
        class:class_id (
          id,
          class_name,
          class_code
        )
      `)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.staff_id) {
        query = query.eq('staff_id', filters.staff_id);
      }
      if (filters.advisor_id) {
        query = query.eq('advisor_id', filters.advisor_id);
      }
      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        // Add one day to include the entire end date
        const endDate = new Date(filters.date_to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getRequests] Error:', error);
      throw error;
    }

    console.log('[getRequests] Found', data?.length || 0, 'requests');
    return data;
  } catch (error: any) {
    console.error('[getRequests] Exception:', error);
    throw error;
  }
};

/**
 * Get request statistics for a staff member
 */
export const getStaffRequestStats = async (staffId: string, dateFrom?: string, dateTo?: string) => {
  try {
    console.log('[getStaffRequestStats] Fetching stats for staff:', staffId);

    let query = supabase
      .from('requests')
      .select('status, requested_points, approved_points')
      .eq('staff_id', staffId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getStaffRequestStats] Error:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(r => r.status === 'pending').length || 0,
      approved: data?.filter(r => r.status === 'approved').length || 0,
      rejected: data?.filter(r => r.status === 'rejected').length || 0,
      correction: data?.filter(r => r.status === 'correction').length || 0,
      totalPointsRequested: data?.reduce((sum, r) => sum + r.requested_points, 0) || 0,
      totalPointsApproved: data?.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.approved_points || 0), 0) || 0,
    };

    console.log('[getStaffRequestStats] Stats:', stats);
    return stats;
  } catch (error: any) {
    console.error('[getStaffRequestStats] Exception:', error);
    throw error;
  }
};
