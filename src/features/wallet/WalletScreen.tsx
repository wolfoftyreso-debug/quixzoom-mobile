import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from '@/services/supabase'

interface Payout {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
}

export function WalletScreen() {
  const [balance, setBalance] = useState(0)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()
      setBalance(profile?.balance || 0)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: pr } = await (supabase as any)
        .from('payout_requests')
        .select('id, amount, currency, status, created_at')
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setPayouts(pr || [])
      setLoading(false)
    })()
  }, [])

  const STATUS_COLOR: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    paid: '#6366f1',
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#6366f1" />
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Tillgängligt saldo</Text>
        <Text style={styles.balanceAmount}>{(balance / 100).toFixed(2)} SEK</Text>
      </View>

      <Text style={styles.sectionTitle}>Utbetalningar</Text>
      <FlatList
        data={payouts}
        keyExtractor={p => p.id}
        renderItem={({ item: p }) => (
          <View style={styles.row}>
            <Text style={styles.date}>
              {new Date(p.created_at).toLocaleDateString('sv-SE')}
            </Text>
            <Text style={styles.amount}>{(p.amount / 100).toFixed(2)} {p.currency}</Text>
            <Text style={[styles.status, { color: STATUS_COLOR[p.status] || '#fff' }]}>
              {p.status}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga utbetalningar ännu</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1B', paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A1B' },
  balanceCard: {
    margin: 16,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800' },
  sectionTitle: { color: '#fff', fontWeight: '600', fontSize: 18, paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  date: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  amount: { color: '#fff', fontWeight: '600', fontSize: 14 },
  status: { fontSize: 13, fontWeight: '600' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40, fontSize: 15 },
})
