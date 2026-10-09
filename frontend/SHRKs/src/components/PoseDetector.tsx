import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function PoseDetector() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [statusText, setStatusText] = useState('Waiting for camera');
  const [score, setScore] = useState(0);
  const cameraRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const drawSkeleton = (landmarks: any[]) => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 640;
    const height = canvas.height || 480;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#f97316';

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 7],
      [1, 5], [5, 6], [6, 7], [1, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [19, 20],
      [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [31, 33], [32, 34], [27, 35], [28, 36], [35, 36], [35, 37], [36, 38], [37, 39], [38, 40], [39, 41], [40, 42], [41, 43], [42, 44], [43, 45], [44, 46],
    ];

    for (const [aIndex, bIndex] of connections) {
      const a = landmarks[aIndex];
      const b = landmarks[bIndex];
      if (!a || !b) continue;

      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    }

    landmarks.forEach((point) => {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (!permission && !isCameraActive) {
        requestPermission();
      }
    }
  }, [permission, isCameraActive]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!isCameraActive) return;

    let cancelled = false;

    async function startWebCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
          await cameraRef.current.play();
        }
        setStatusText('Camera ready');
      } catch (error) {
        console.error(error);
        setStatusText('Camera access denied');
      }
    }

    async function initPose() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const pose = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        if (!cancelled) {
          poseRef.current = pose;
          setStatusText('Pose model ready');
        } else {
          pose.close();
        }
      } catch (error) {
        console.error(error);
        setStatusText('Pose model failed to load');
      }
    }

    startWebCamera();
    initPose();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      poseRef.current?.close();
    };
  }, [isCameraActive]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isCameraActive || !cameraRef.current || !poseRef.current) return;

    const video = cameraRef.current;
    const canvas = overlayRef.current;

    const tick = async () => {
      if (!video || !poseRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      try {
        const result = poseRef.current.detectForVideo(video, performance.now());
        const landmarks = result.landmarks?.[0] ?? [];

        if (landmarks.length > 0) {
          drawSkeleton(landmarks);

          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          const leftHip = landmarks[23];
          const rightHip = landmarks[24];
          const nose = landmarks[0];

          const shoulderDiff = Math.abs((leftShoulder?.x ?? 0) - (rightShoulder?.x ?? 0));
          const hipDiff = Math.abs((leftHip?.x ?? 0) - (rightHip?.x ?? 0));
          const posture = Math.max(0, 100 - (shoulderDiff + hipDiff) * 220 - Math.abs((nose?.y ?? 0) - 0.5) * 110);
          setScore(Math.round(Math.min(100, Math.max(0, posture))));
          setStatusText('Body detected');
        } else {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          setStatusText('No body detected');
          setScore(0);
        }
      } catch (error) {
        console.error(error);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isCameraActive]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Pose Detector</Text>
          <Text style={styles.badge}>{statusText}</Text>
        </View>

        {!isCameraActive ? (
          <View style={styles.startWrap}>
            <Button title="Start Camera" onPress={() => setIsCameraActive(true)} />
          </View>
        ) : (
          <View style={styles.cameraStage}>
            <video
              ref={cameraRef}
              autoPlay
              muted
              playsInline
              style={styles.video}
            />
            <canvas
              ref={overlayRef}
              style={styles.overlayCanvas}
            />
            <View style={styles.overlayCard}>
              <Text style={styles.overlayLabel}>Posture score</Text>
              <Text style={styles.overlayValue}>{score}%</Text>
            </View>
          </View>
        )}

        <Text style={styles.note}>Web version uses the browser camera stream directly so MediaPipe can read actual frames.</Text>
        <Text style={styles.note}>- Skeleton overlay is drawn directly on top of the webcam.</Text>
        <Text style={styles.note}>- This is the real posture prototype path for the web app.</Text>
      </View>
    );
  }

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera access required</Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pose Detector</Text>
        <Text style={styles.badge}>{statusText}</Text>
      </View>

      {!isCameraActive ? (
        <View style={styles.startWrap}>
          <Button title="Start Camera" onPress={() => setIsCameraActive(true)} />
        </View>
      ) : (
        <View style={styles.cameraStage}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
          <View style={styles.overlayCard}>
            <Text style={styles.overlayLabel}>Posture score</Text>
            <Text style={styles.overlayValue}>{score}%</Text>
          </View>
        </View>
      )}

      <Text style={styles.note}>Real webcam pose estimation is active on web using MediaPipe.</Text>
      <Text style={styles.note}>- Model runs on the browser via WASM.</Text>
      <Text style={styles.note}>- Landmarks can be drawn on the video frame next.</Text>
      <Text style={styles.note}>- Ready for custom scoring and exercise detection.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },
  startWrap: {
    marginBottom: 16,
  },
  cameraStage: {
    flex: 1,
    minHeight: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    objectFit: 'cover',
  },
  overlayCanvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 2,
  },
  overlayCard: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 3,
  },
  overlayLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  overlayValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
});
