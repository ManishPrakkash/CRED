import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { Award, Eye, EyeOff, Lock, Mail, UserCheck, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !role) {
      Alert.alert('Error', 'Please fill in all fields and select a role');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password, role);
      router.replace('/' as Href);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { 
      id: 'student' as UserRole, 
      title: 'Student', 
      description: 'View your CredPoints and class performance', 
      icon: UserCheck,
      color: '#2563eb'
    },
    { 
      id: 'representative' as UserRole, 
      title: 'Representative', 
      description: 'Submit point change requests for students', 
      icon: Users,
      color: '#10b981'
    },
    { 
      id: 'advisor' as UserRole, 
      title: 'Advisor', 
      description: 'Manage classes and approve requests', 
      icon: Award,
      color: '#f59e0b'
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient 
        colors={['#2563eb', '#3b82f6']} 
        className="pb-12"
      >
        <View className="pt-16 pb-8 px-6">
          <Text className="text-white text-3xl font-bold">Welcome to CRED</Text>
          <Text className="text-white/90 text-lg mt-2">Earn your Cred. Build your reputation.</Text>
        </View>
      </LinearGradient>

      <View className="px-6 -mt-8">
        <View className="bg-white rounded-2xl shadow-lg p-6">
          <Text className="text-gray-800 text-2xl font-bold mb-2">Login to Your Account</Text>
          <Text className="text-gray-500 mb-6">Enter your credentials to continue</Text>
          
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
              <Mail color="#64748b" size={20} />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
              <Lock color="#64748b" size={20} />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#64748b" size={20} />
                ) : (
                  <Eye color="#64748b" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="mb-8">
            <Text className="text-gray-700 font-medium mb-3">Select Your Role</Text>
            <View className="gap-3">
              {roles.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    className={`border-2 rounded-xl p-4 ${role === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onPress={() => setRole(item.id)}
                  >
                    <View className="flex-row items-center">
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <IconComponent size={20} color={item.color} />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="font-semibold text-gray-800">{item.title}</Text>
                        <Text className="text-gray-600 text-sm">{item.description}</Text>
                      </View>
                      <View 
                        className={`w-5 h-5 rounded-full border-2 ${role === item.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
                      >
                        {role === item.id && (
                          <View className="w-3 h-3 bg-white rounded-full m-0.5" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <TouchableOpacity
            className={`py-4 rounded-xl items-center justify-center ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="mt-6 mb-12">
          <Text className="text-center text-gray-500 text-sm">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
