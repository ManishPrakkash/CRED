import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Stack, usePathname, useRouter } from 'expo-router';
import React from 'react';

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, pathname]);

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
