import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'advisor';
  avatar: string | null;
  employee_id: string | null;
  department: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Login user with Supabase Auth
 * Authenticates via auth.users and fetches profile from public.users
 */
export const loginWithSupabase = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    console.log('🔐 Attempting login with email:', email.toLowerCase().trim());
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (authError || !authData.user) {
      const errorMsg = authError?.message || 'Unknown auth error';
      console.error('❌ Auth error:', errorMsg);
      throw new Error(`Auth failed: ${errorMsg}`);
    }
    
    console.log('✅ Auth successful for user:', authData.user.id);

    // Step 2: Fetch user profile from public.users (linked by id)
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      // User exists in auth but not in public.users - data sync issue
      throw new Error('User profile not found. Please contact support.');
    }

    // Step 3: Convert to app User format
    const user: User = {
      id: profileData.id,
      email: profileData.email,
      name: profileData.name,
      role: profileData.role as 'staff' | 'advisor',
      avatar: profileData.avatar_url || undefined,
      joinedClasses: [],
      currentClassId: null,
      notifications: [],
    };

    return user;
  } catch (error: any) {
    console.error('Supabase login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Change user password with current password verification
 * Updates both auth.users and public.users
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Step 1: Get current user
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser?.email) {
      throw new Error('User not authenticated');
    }

    console.log('🔐 Verifying current password for:', currentUser.email);

    // Step 2: Verify current password by attempting sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    });

    if (verifyError) {
      console.error('❌ Current password verification failed');
      return { success: false, error: 'Current password is incorrect' };
    }

    console.log('✅ Current password verified');

    // Step 3: Update to new password in auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('❌ Password update failed:', updateError.message);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Password changed successfully in auth.users');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Password change error:', error);
    return { success: false, error: error.message };
  }
};
