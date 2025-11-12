import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack, usePathname } from 'expo-router';
import React from 'react';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user && pathname !== '/login') {
    return <Redirect href="/login" />;
  }
  if (user && pathname === '/login') {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </NavigationGuard>
    </AuthProvider>
  );
}
