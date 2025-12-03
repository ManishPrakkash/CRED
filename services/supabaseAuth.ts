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
  created_at: string;
  updated_at: string;
}

/**
 * Login user with Supabase database
 * Validates email and password against users table
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

    // Convert to app User format
    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as 'staff' | 'advisor',
      avatar: data.avatar || undefined,
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
