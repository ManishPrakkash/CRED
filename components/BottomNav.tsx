import { useAuth } from '@/contexts/AuthContext';
import { Href, usePathname, useRouter } from 'expo-router';
import { ClipboardList, Home, User as UserIcon, Users, Trophy } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PENDING_REQUESTS_KEY = '@cred_pending_requests_count';
const CORRECTION_REQUESTS_KEY = '@cred_correction_requests_count';

type TabKey = 'home' | 'requests' | 'classes' | 'profile' | 'leaderboard';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [pendingCount, setPendingCount] = useState(0);
  const [correctionCount, setCorrectionCount] = useState(0);

  // Load request counts
  useEffect(() => {
    if (user?.role === 'advisor') {
      loadRequestCounts();
      
      // Set up interval to refresh counts
      const interval = setInterval(loadRequestCounts, 2000);
      return () => clearInterval(interval);
    }
  }, [user?.role, pathname]);

  const loadRequestCounts = async () => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
      const correction = await AsyncStorage.getItem(CORRECTION_REQUESTS_KEY);
      setPendingCount(pending ? parseInt(pending) : 0);
      setCorrectionCount(correction ? parseInt(correction) : 0);
    } catch (error) {
      console.error('Failed to load request counts:', error);
    }
  };

  // role-aware visibility
  const canSeeRequests = user?.role === 'staff' || user?.role === 'advisor';
  const canSeeClasses = user?.role === 'advisor';
  const canSeeLeaderboard = true; // All roles can see leaderboard

  const totalRequests = pendingCount + correctionCount;

  const tabs: Array<{
    key: TabKey;
    label: string;
    href: Href;
    icon: React.ComponentType<any>;
    visible: boolean;
    active: boolean;
    badge?: number;
  }> = [
    { key: 'home', label: 'Dashboard', href: '/' as Href, icon: Home, visible: true, active: pathname === '/' },
    { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' as Href, icon: Trophy, visible: !!canSeeLeaderboard, active: pathname?.startsWith('/leaderboard') ?? false },
    { key: 'requests', label: 'Requests', href: '/request' as Href, icon: ClipboardList, visible: !!canSeeRequests, active: pathname?.startsWith('/request') ?? false, badge: user?.role === 'advisor' ? totalRequests : undefined },
    { key: 'classes', label: 'Classes', href: '/classManagement' as Href, icon: Users, visible: !!canSeeClasses, active: pathname?.startsWith('/classManagement') ?? false },
    { key: 'profile', label: 'Profile', href: '/profile' as Href, icon: UserIcon, visible: true, active: pathname?.startsWith('/profile') ?? false },
  ];

  return (
    <View 
      className="flex-row items-center justify-around border-t border-gray-200 bg-white py-2 px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {tabs.filter(t => t.visible).map((t) => {
        const Icon = t.icon;
        return (
          <TouchableOpacity key={t.key} onPress={() => router.push(t.href)} className="items-center justify-center relative">
            <Icon size={20} color={t.active ? '#2563eb' : '#64748b'} />
            {t.badge !== undefined && t.badge > 0 && (
              <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">{t.badge > 9 ? '9+' : t.badge}</Text>
              </View>
            )}
            <Text className={`text-xs mt-1 ${t.active ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
