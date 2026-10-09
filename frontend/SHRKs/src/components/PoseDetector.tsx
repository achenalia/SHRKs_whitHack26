import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { Camera } from 'expo-camera'

export default function PoseDetector() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const cameraRef = useRef<Camera | null>(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>
  if (hasPermission === false) return <Text>No access to camera</Text>

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pose Detector (skeleton)</Text>
      {!isCameraActive ? (
        <Button title="Start Camera" onPress={() => setIsCameraActive(true)} />
      ) : (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} ref={cameraRef} />
        </View>
      )}

      <Text style={styles.note}>
        This component is a placeholder. To integrate Mediapipe pose detection:
      </Text>
      <Text style={styles.note}>- Use a camera frame stream or GL texture.</Text>
      <Text style={styles.note}>- Feed frames to Mediapipe WASM or native module.</Text>
      <Text style={styles.note}>- Render pose landmarks over the preview.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, marginBottom: 12 },
  cameraContainer: { width: '100%', height: 400, overflow: 'hidden' },
  camera: { flex: 1 },
  note: { marginTop: 8, fontSize: 12 },
})
