import { useAuth } from '@/contexts/AuthContext';
import { Href, usePathname, useRouter } from 'expo-router';
import { ClipboardList, Home, User as UserIcon, Users, Trophy } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type TabKey = 'home' | 'requests' | 'classes' | 'profile' | 'leaderboard';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // role-aware visibility
  const canSeeRequests = user?.role === 'staff' || user?.role === 'advisor';
  const canSeeClasses = user?.role === 'advisor';
  const canSeeLeaderboard = user?.role !== 'staff'; // Staff don't see leaderboard

  const tabs: Array<{
    key: TabKey;
    label: string;
    href: Href;
    icon: React.ComponentType<any>;
    visible: boolean;
    active: boolean;
  }> = [
    { key: 'home', label: 'Dashboard', href: '/' as Href, icon: Home, visible: true, active: pathname === '/' },
    { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' as Href, icon: Trophy, visible: !!canSeeLeaderboard, active: pathname?.startsWith('/leaderboard') ?? false },
    { key: 'requests', label: 'Requests', href: '/request' as Href, icon: ClipboardList, visible: !!canSeeRequests, active: pathname?.startsWith('/request') ?? false },
    { key: 'classes', label: 'Classes', href: '/classManagement' as Href, icon: Users, visible: !!canSeeClasses, active: pathname?.startsWith('/classManagement') ?? false },
    { key: 'profile', label: 'Profile', href: '/profile' as Href, icon: UserIcon, visible: true, active: pathname?.startsWith('/profile') ?? false },
  ];

  return (
    <View className="flex-row items-center justify-around border-t border-gray-200 bg-white py-2 px-3">
      {tabs.filter(t => t.visible).map((t) => {
        const Icon = t.icon;
        return (
          <TouchableOpacity key={t.key} onPress={() => router.push(t.href)} className="items-center justify-center">
            <Icon size={20} color={t.active ? '#2563eb' : '#64748b'} />
            <Text className={`text-xs mt-1 ${t.active ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
