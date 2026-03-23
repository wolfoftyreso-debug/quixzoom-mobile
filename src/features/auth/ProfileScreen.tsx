import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '@/services/supabase'

export function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email || null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role, display_name')
        .eq('id', user?.id)
        .single()
      setRole(profile?.role || 'photographer')
    })()
  }, [])

  const signOut = async () => {
    Alert.alert('Logga ut', 'Är du säker?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Logga ut', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{email?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.role}>{role === 'photographer' ? '📷 Fotograf' : '🏢 Klient'}</Text>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Logga ut</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1B', alignItems: 'center', paddingTop: 80 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  email: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  role: { color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 48 },
  signOutBtn: {
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12,
  },
  signOutText: { color: '#ef4444', fontWeight: '600' },
})
