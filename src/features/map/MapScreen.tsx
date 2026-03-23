import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { supabase } from '@/services/supabase'

interface Mission {
  id: string
  title: string
  latitude: number
  longitude: number
  status: string
  reward_amount: number
}

export function MapScreen() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [region, setRegion] = useState<Region>({
    latitude: 59.33,
    longitude: 18.07,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  })

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({})
        setRegion(r => ({
          ...r,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }))
      }
    })()
  }, [])

  const fetchMissions = async (r: Region) => {
    const latD = r.latitudeDelta / 2
    const lngD = r.longitudeDelta / 2
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('missions')
      .select('id, title, latitude, longitude, status, reward_amount')
      .eq('status', 'open')
      .gte('latitude', r.latitude - latD)
      .lte('latitude', r.latitude + latD)
      .gte('longitude', r.longitude - lngD)
      .lte('longitude', r.longitude + lngD)
      .limit(100)
    setMissions(data || [])
  }

  useEffect(() => {
    fetchMissions(region)
  }, [region])

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {missions.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={`€${m.reward_amount}`}
            pinColor="#6366f1"
          />
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
