import { supabase } from '@/lib/supabase';
import type { Class, CreateClassParams, JoinedClass } from '@/lib/types';

/**
 * Create a new class (Advisor only)
 * @param advisorId - The advisor's user ID
 * @param params - Class creation parameters
 */
export const createClass = async (
  advisorId: string,
  params: CreateClassParams
): Promise<Class> => {
  try {
    // Check for duplicate class code
    const { data: existingByCode } = await supabase
      .from('classes')
      .select('id, class_code')
      .eq('class_code', params.class_code)
      .eq('advisor_id', advisorId)
      .maybeSingle();

    if (existingByCode) {
      throw new Error(`The class code "${params.class_code}" is already in use. Please use a different code.`);
    }

    // Check for duplicate class name
    const { data: existingByName } = await supabase
      .from('classes')
      .select('id, class_name')
      .ilike('class_name', params.class_name)
      .eq('advisor_id', advisorId)
      .maybeSingle();

    if (existingByName) {
      throw new Error(`A class named "${params.class_name}" already exists. Please use a different name.`);
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([{
        class_code: params.class_code,
        class_name: params.class_name,
        department: params.department || null,
        semester: params.semester || null,
        academic_year: params.academic_year || null,
        advisor_id: advisorId,
        total_students: params.total_students || 0, // Max capacity
        current_enrollment: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Create class error:', error);
      throw new Error(error.message || 'Failed to create class');
    }

    return data as Class;
  } catch (error: any) {
    console.error('Create class error:', error);
    throw new Error(error.message || 'Failed to create class');
  }
};

/**
 * Get all classes for an advisor
 * @param advisorId - The advisor's user ID
 */
export const getAdvisorClasses = async (advisorId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get advisor classes error:', error);
      throw new Error(error.message || 'Failed to fetch classes');
    }

    return (data || []) as Class[];
  } catch (error: any) {
    console.error('Get advisor classes error:', error);
    throw new Error(error.message || 'Failed to fetch classes');
  }
};

/**
 * Get class by class code
 * @param classCode - The unique class code
 */
export const getClassByCode = async (classCode: string): Promise<Class | null> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('class_code', classCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Get class by code error:', error);
      throw new Error(error.message || 'Failed to fetch class');
    }

    return data as Class;
  } catch (error: any) {
    console.error('Get class by code error:', error);
    throw new Error(error.message || 'Failed to fetch class');
  }
};

/**
 * Staff joins a class by entering class code
 * @param staffId - The staff user ID
 * @param classCode - The class code to join
 */
export const joinClassByCode = async (
  staffId: string,
  classCode: string
): Promise<{ success: boolean; class?: Class; message: string }> => {
  try {
    // 1. Find the class by code and fetch advisor name
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        users!classes_advisor_id_fkey(name)
      `)
      .eq('class_code', classCode)
      .single();

    if (classError || !classData) {
      return {
        success: false,
        message: 'Class not found. Please check the class code.',
      };
    }

    // 2. Check if class enrollment is open
    if (!classData.is_open) {
      return {
        success: false,
        class: classData,
        message: 'This class is currently closed for enrollment. Please contact your HoD.',
      };
    }

    // 3. Check if class is at maximum capacity (if set)
    if (classData.total_students > 0 && classData.current_enrollment >= classData.total_students) {
      return {
        success: false,
        class: classData,
        message: `Class is full (${classData.current_enrollment}/${classData.total_students}). Please contact your HoD for assistance.`,
      };
    }

    // 4. Get current user's joined_classes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('joined_classes')
      .eq('id', staffId)
      .single();

    if (userError) {
      console.error('Get user error:', userError);
      throw new Error('Failed to fetch user data');
    }

    const currentJoinedClasses = (userData?.joined_classes || []) as JoinedClass[];

    // 5. Check if already joined
    const alreadyJoined = currentJoinedClasses.some(
      (jc: JoinedClass) => jc.class_id === classData.id
    );

    if (alreadyJoined) {
      return {
        success: false,
        class: classData,
        message: 'You have already joined this class.',
      };
    }

    // 6. Add class to user's joined_classes
    const newJoinedClass: JoinedClass = {
      class_id: classData.id,
      class_code: classData.class_code,
      class_name: classData.class_name,
      advisor_name: (classData.users as any)?.name || 'Unknown',
      joined_at: new Date().toISOString(),
    };

    const updatedJoinedClasses = [...currentJoinedClasses, newJoinedClass];

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ joined_classes: updatedJoinedClasses })
      .eq('id', staffId);

    if (updateUserError) {
      console.error('Update user joined_classes error:', updateUserError);
      throw new Error('Failed to join class');
    }

    // 6. Increment current_enrollment in classes table
    const { error: updateClassError } = await supabase
      .from('classes')
      .update({ current_enrollment: (classData.current_enrollment || 0) + 1 })
      .eq('id', classData.id);

    if (updateClassError) {
      console.error('Update class current_enrollment error:', updateClassError);
      // Don't throw - user is already added, just log the error
    }

    return {
      success: true,
      class: classData,
      message: `Successfully joined ${classData.class_name}!`,
    };
  } catch (error: any) {
    console.error('Join class error:', error);
    return {
      success: false,
      message: error.message || 'Failed to join class',
    };
  }
};

/**
 * Get all classes a staff member has joined with advisor names
 * @param staffId - The staff user ID
 */
export const getStaffClasses = async (staffId: string): Promise<JoinedClass[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('joined_classes')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      console.error('Get staff classes error:', error);
      throw new Error(error.message || 'Failed to fetch joined classes');
    }

    // Return empty array if user not found or has no classes
    if (!data) {
      console.log('User not found or has no joined classes');
      return [];
    }

    const joinedClasses = (data?.joined_classes || []) as JoinedClass[];

    // Fetch advisor names for classes that don't have them
    const classesNeedingAdvisor = joinedClasses.filter(jc => !jc.advisor_name);

    if (classesNeedingAdvisor.length > 0) {
      const classIds = classesNeedingAdvisor.map(jc => jc.class_id);

      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          id,
          users!classes_advisor_id_fkey(name)
        `)
        .in('id', classIds);

      if (classesData) {
        // Update joined classes with advisor names
        const updatedJoinedClasses = joinedClasses.map(jc => {
          const classInfo = classesData.find(c => c.id === jc.class_id);
          if (classInfo && !jc.advisor_name) {
            return {
              ...jc,
              advisor_name: (classInfo.users as any)?.name || 'Unknown',
            };
          }
          return jc;
        });

        // Update database with advisor names
        await supabase
          .from('users')
          .update({ joined_classes: updatedJoinedClasses })
          .eq('id', staffId);

        return updatedJoinedClasses;
      }
    }

    return joinedClasses;
  } catch (error: any) {
    console.error('Get staff classes error:', error);
    throw new Error(error.message || 'Failed to fetch joined classes');
  }
};

/**
 * Delete a class (Advisor only)
 * @param classId - The class ID to delete
 * @param advisorId - The advisor's user ID (for verification)
 */
export const deleteClass = async (
  classId: string,
  advisorId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify the class belongs to this advisor
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('advisor_id, class_name')
      .eq('id', classId)
      .single();

    if (fetchError || !classData) {
      return {
        success: false,
        message: 'Class not found',
      };
    }

    if (classData.advisor_id !== advisorId) {
      return {
        success: false,
        message: 'You do not have permission to delete this class',
      };
    }

    // Delete the class (CASCADE will handle related requests)
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (deleteError) {
      console.error('Delete class error:', deleteError);
      throw new Error(deleteError.message || 'Failed to delete class');
    }

    // Note: We should also remove this class from all users' joined_classes
    // This requires a more complex update - for now, staff will see outdated data until they refresh
    // TODO: Implement cleanup of joined_classes in users table

    return {
      success: true,
      message: `${classData.class_name} deleted successfully`,
    };
  } catch (error: any) {
    console.error('Delete class error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete class',
    };
  }
};

/**
 * Get class details by ID
 * @param classId - The class ID
 */
export const getClassById = async (classId: string): Promise<Class | null> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Get class by ID error:', error);
      throw new Error(error.message || 'Failed to fetch class');
    }

    return data as Class;
  } catch (error: any) {
    console.error('Get class by ID error:', error);
    throw new Error(error.message || 'Failed to fetch class');
  }
};

/**
 * Get count of staff in a class
 * @param classId - The class ID
 */
export const getClassStaffCount = async (classId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('total_students')
      .eq('id', classId)
      .single();

    if (error) {
      console.error('Get class staff count error:', error);
      return 0;
    }

    return data?.total_students || 0;
  } catch (error: any) {
    console.error('Get class staff count error:', error);
    return 0;
  }
};

/**
 * Get staff members enrolled in a class
 * @param classId - The class ID
 */
export const getClassStaff = async (classId: string): Promise<Array<{ id: string; name: string; email: string; avatar?: string | null; joined_at: string }>> => {
  try {
    console.log('[getClassStaff] Fetching staff for class ID:', classId);

    // Fetch all staff users with their joined_classes
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, joined_classes')
      .eq('role', 'staff');

    if (error) {
      console.error('[getClassStaff] Database error:', error);
      throw new Error(error.message || 'Failed to fetch staff list');
    }

    console.log('[getClassStaff] Total staff users found:', users?.length || 0);

    const staffList: Array<{ id: string; name: string; email: string; avatar?: string | null; joined_at: string }> = [];

    // Filter users who have this class in their joined_classes array
    (users || []).forEach((user: any) => {
      console.log(`[getClassStaff] Checking user ${user.name}:`, {
        joined_classes: user.joined_classes,
        has_joined_classes: !!user.joined_classes,
        joined_classes_length: user.joined_classes?.length || 0
      });

      const joinedClass = (user.joined_classes || []).find((jc: any) => {
        console.log(`[getClassStaff] Comparing class IDs: ${jc.class_id} === ${classId}`, jc.class_id === classId);
        return jc.class_id === classId;
      });

      if (joinedClass) {
        console.log(`[getClassStaff] ✓ User ${user.name} is enrolled in this class`);
        staffList.push({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          joined_at: joinedClass.joined_at,
        });
      }
    });

    console.log('[getClassStaff] Final staff list:', staffList);
    console.log('[getClassStaff] Total enrolled staff:', staffList.length);

    // Sort by joined date (most recent first)
    staffList.sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());

    return staffList;
  } catch (error: any) {
    console.error('[getClassStaff] Error:', error);
    throw new Error(error.message || 'Failed to fetch staff list');
  }
};

/**
 * Validate and clean staff's joined classes
 * Removes classes that no longer exist in database
 * @param staffId - The staff user ID
 */
export const validateAndCleanJoinedClasses = async (
  staffId: string
): Promise<{ validClasses: JoinedClass[]; removedClasses: JoinedClass[] }> => {
  try {
    // Get staff's current joined classes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('joined_classes')
      .eq('id', staffId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return { validClasses: [], removedClasses: [] };
    }

    const joinedClasses = (userData?.joined_classes || []) as JoinedClass[];

    if (joinedClasses.length === 0) {
      return { validClasses: [], removedClasses: [] };
    }

    // Get all class IDs from joined classes
    const classIds = joinedClasses.map(jc => jc.class_id);

    // Check which classes still exist in database
    const { data: existingClasses, error: classError } = await supabase
      .from('classes')
      .select('id')
      .in('id', classIds);

    if (classError) {
      console.error('Error checking classes:', classError);
      return { validClasses: joinedClasses, removedClasses: [] };
    }

    const existingClassIds = new Set(existingClasses.map(c => c.id));

    // Separate valid and removed classes
    const validClasses = joinedClasses.filter(jc => existingClassIds.has(jc.class_id));
    const removedClasses = joinedClasses.filter(jc => !existingClassIds.has(jc.class_id));

    // Update user's joined_classes if any were removed
    if (removedClasses.length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ joined_classes: validClasses })
        .eq('id', staffId);

      if (updateError) {
        console.error('Error updating joined_classes:', updateError);
      }
    }

    return { validClasses, removedClasses };
  } catch (error: any) {
    console.error('Error validating joined classes:', error);
    return { validClasses: [], removedClasses: [] };
  }
};

/**
 * Get staff CRED points from database
 * @param staffId - The staff user ID
 */
export const getStaffCredPoints = async (staffId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('cred_points')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      console.error('Get staff CRED points error:', error);
      return 0;
    }

    // Return 0 if user not found
    if (!data) {
      console.log('User not found, returning 0 CRED points');
      return 0;
    }

    return data?.cred_points || 0;
  } catch (error: any) {
    console.error('Get staff CRED points error:', error);
    return 0;
  }
};

/**
 * Staff leaves a class
 * Removes class from user's joined_classes and decrements current_enrollment
 * @param staffId - The staff user ID
 * @param classId - The class ID to leave
 */
export const leaveClass = async (
  staffId: string,
  classId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Get current user's joined_classes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('joined_classes')
      .eq('id', staffId)
      .single();

    if (userError) {
      console.error('Get user error:', userError);
      throw new Error('Failed to fetch user data');
    }

    const currentJoinedClasses = (userData?.joined_classes || []) as JoinedClass[];

    // 2. Find the class to leave
    const classToLeave = currentJoinedClasses.find(
      (jc: JoinedClass) => jc.class_id === classId
    );

    if (!classToLeave) {
      return {
        success: false,
        message: 'You are not a member of this class.',
      };
    }

    // 3. Remove class from joined_classes array
    const updatedJoinedClasses = currentJoinedClasses.filter(
      (jc: JoinedClass) => jc.class_id !== classId
    );

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ joined_classes: updatedJoinedClasses })
      .eq('id', staffId);

    if (updateUserError) {
      console.error('Update user joined_classes error:', updateUserError);
      throw new Error('Failed to leave class');
    }

    // 4. Decrement current_enrollment in classes table
    const { data: classData, error: getClassError } = await supabase
      .from('classes')
      .select('current_enrollment')
      .eq('id', classId)
      .single();

    if (!getClassError && classData) {
      const newEnrollment = Math.max(0, (classData.current_enrollment || 1) - 1);

      const { error: updateClassError } = await supabase
        .from('classes')
        .update({ current_enrollment: newEnrollment })
        .eq('id', classId);

      if (updateClassError) {
        console.error('Update class current_enrollment error:', updateClassError);
        // Don't throw - user is already removed, just log the error
      }
    }

    return {
      success: true,
      message: `Successfully left ${classToLeave.class_name}. You can rejoin anytime if needed.`,
    };
  } catch (error: any) {
    console.error('Leave class error:', error);
    return {
      success: false,
      message: error.message || 'Failed to leave class',
    };
  }
};

/**
 * Toggle class enrollment status (open/close)
 * @param classId - The class ID
 * @param advisorId - The advisor's user ID
 * @param isOpen - Whether the class should be open for enrollment
 */
export const toggleClassEnrollment = async (
  classId: string,
  advisorId: string,
  isOpen: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify the advisor owns this class
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('advisor_id')
      .eq('id', classId)
      .single();

    if (fetchError) {
      throw new Error('Class not found');
    }

    if (classData.advisor_id !== advisorId) {
      throw new Error('You do not have permission to modify this class');
    }

    // Update the is_open status
    const { error: updateError } = await supabase
      .from('classes')
      .update({ is_open: isOpen })
      .eq('id', classId);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      message: isOpen
        ? 'Class is now open for enrollment'
        : 'Class enrollment has been closed',
    };
  } catch (error: any) {
    console.error('Toggle class enrollment error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update class status',
    };
  }
};
