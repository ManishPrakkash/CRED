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
    // 1. Find the class by code
    const classData = await getClassByCode(classCode);
    
    if (!classData) {
      return {
        success: false,
        message: 'Class not found. Please check the class code.',
      };
    }

    // 2. Check if class is at maximum capacity
    if (classData.total_students > 0 && classData.current_enrollment >= classData.total_students) {
      return {
        success: false,
        class: classData,
        message: `Class is full (${classData.current_enrollment}/${classData.total_students}). Please contact your advisor for assistance.`,
      };
    }

    // 3. Get current user's joined_classes
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

    // 4. Check if already joined
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

    // 5. Add class to user's joined_classes
    const newJoinedClass: JoinedClass = {
      class_id: classData.id,
      class_code: classData.class_code,
      class_name: classData.class_name,
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
 * Get all classes a staff member has joined
 * @param staffId - The staff user ID
 */
export const getStaffClasses = async (staffId: string): Promise<JoinedClass[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('joined_classes')
      .eq('id', staffId)
      .single();

    if (error) {
      console.error('Get staff classes error:', error);
      throw new Error(error.message || 'Failed to fetch joined classes');
    }

    return (data?.joined_classes || []) as JoinedClass[];
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
