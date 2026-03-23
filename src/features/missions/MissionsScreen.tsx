import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native'
import { supabase } from '@/services/supabase'

interface Mission {
  id: string
  title: string
  description: string
  status: 'open' | 'active' | 'completed' | 'cancelled'
  reward_amount: number
  reward_currency: string
  city: string
  deadline_at: string | null
}

const STATUS_COLOR: Record<string, string> = {
  open: '#6366f1',
  active: '#f59e0b',
  completed: '#10b981',
  cancelled: '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Öppen',
  active: 'Aktiv',
  completed: 'Klar',
  cancelled: 'Avbruten',
}

export function MissionsScreen() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetch = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('missions')
      .select('id, title, description, status, reward_amount, reward_currency, city, deadline_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)
    setMissions(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetch() }, [])

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#6366f1" />
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tillgängliga uppdrag</Text>
      <FlatList
        data={missions}
        keyExtractor={m => m.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch() }} tintColor="#6366f1" />
        }
        renderItem={({ item: m }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title} numberOfLines={1}>{m.title}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[m.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[m.status] }]}>
                  {STATUS_LABEL[m.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{m.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.city}>📍 {m.city || 'Okänd plats'}</Text>
              <Text style={styles.reward}>
                {(m.reward_amount / 100).toFixed(0)} {m.reward_currency}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga uppdrag just nu</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1B', paddingHorizontal: 16, paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A1B' },
  heading: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#fff', fontWeight: '600', fontSize: 16, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  desc: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  city: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  reward: { color: '#6366f1', fontWeight: '700', fontSize: 14 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 60, fontSize: 16 },
})
