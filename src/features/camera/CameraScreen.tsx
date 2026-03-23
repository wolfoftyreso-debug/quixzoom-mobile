import { useState, useRef } from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { supabase } from '@/services/supabase'

interface Props {
  missionId: string
  onSubmitted: () => void
}

export function CameraScreen({ missionId, onSubmitted }: Props) {
  const [permission, requestPermission] = useCameraPermissions()
  const [uploading, setUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Kameratillåtelse krävs</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Ge tillstånd</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const takePicture = async () => {
    if (!cameraRef.current || uploading) return
    setUploading(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
      if (!photo?.uri) throw new Error('Inget foto')

      const fileName = `${missionId}/${Date.now()}.jpg`
      const response = await fetch(photo.uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('mission-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('mission-photos')
        .getPublicUrl(fileName)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('mission_submissions')
        .insert({
          mission_id: missionId,
          image_urls: [publicUrl],
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })

      if (insertError) throw insertError

      Alert.alert('Klart! 🎉', 'Bilden är skickad för granskning.')
      onSubmitted()
    } catch (e: unknown) {
      Alert.alert('Fel', e instanceof Error ? e.message : 'Okänt fel')
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={takePicture}
            disabled={uploading}
          >
            <View style={[styles.captureInner, uploading && styles.uploading]} />
          </TouchableOpacity>
          {uploading && <Text style={styles.uploadText}>Laddar upp...</Text>}
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 5,
  },
  captureInner: { flex: 1, borderRadius: 35, backgroundColor: '#fff' },
  uploading: { backgroundColor: '#6366f1' },
  uploadText: { color: '#fff', fontSize: 14 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A1B',
  },
  text: { color: '#fff', marginBottom: 16, fontSize: 16 },
  btn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: '#fff', fontWeight: '600' },
})
