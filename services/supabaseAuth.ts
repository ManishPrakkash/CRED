import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/types';

export interface SupabaseUser {
  id: string;
  email: string;
  password: string;
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
    // Query user by email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      throw new Error('Invalid email or password');
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, data.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
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
