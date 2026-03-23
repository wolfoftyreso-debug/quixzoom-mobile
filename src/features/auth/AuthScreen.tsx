import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { supabase } from '@/services/supabase'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        Alert.alert('Kolla din e-post!', 'En bekräftelsellänk har skickats.')
      }
    } catch (e: unknown) {
      Alert.alert('Fel', e instanceof Error ? e.message : 'Okänt fel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>quiXzoom</Text>
        <Text style={styles.tagline}>Last mile intelligence capture</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-post"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Lösenord"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
            <Text style={styles.btnText}>
              {loading ? '...' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'signup' : 'login')}>
            <Text style={styles.toggle}>
              {mode === 'login' ? 'Inget konto? Registrera dig' : 'Har du konto? Logga in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1B' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 48,
    fontSize: 14,
  },
  form: { gap: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
})
