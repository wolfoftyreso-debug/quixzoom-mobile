import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, ActivityIndicator } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { MapScreen } from '@/features/map/MapScreen'
import { AuthScreen } from '@/features/auth/AuthScreen'

const Tab = createBottomTabNavigator()

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>
}

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
          tabBarStyle: {
            backgroundColor: '#0A0A1B',
            borderTopColor: 'rgba(255,255,255,0.08)',
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Karta"
          component={MapScreen}
          options={{ tabBarIcon: () => <TabIcon emoji="📍" /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
