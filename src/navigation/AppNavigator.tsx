import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { MapScreen } from '@/features/map/MapScreen'
import { MissionsScreen } from '@/features/missions/MissionsScreen'
import { WalletScreen } from '@/features/wallet/WalletScreen'
import { ProfileScreen } from '@/features/auth/ProfileScreen'
import { AuthScreen } from '@/features/auth/AuthScreen'

const Tab = createBottomTabNavigator()

export function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A1B' }}>
        <ActivityIndicator color="#6366f1" />
      </View>
    )
  }

  if (!session) return <AuthScreen />

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#0A0A1B', borderTopColor: 'rgba(255,255,255,0.08)' },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
          headerShown: false,
        }}
      >
        <Tab.Screen name="Karta" component={MapScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📍</Text> }} />
        <Tab.Screen name="Uppdrag" component={MissionsScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎯</Text> }} />
        <Tab.Screen name="Plånbok" component={WalletScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💰</Text> }} />
        <Tab.Screen name="Profil" component={ProfileScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
