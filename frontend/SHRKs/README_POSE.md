# Pose Detection + Supabase Skeleton

Quick notes to get this skeleton running.

1) Environment

- Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in your environment or `.env` file used by Expo.

Local .env (dev):

- Copy `.env.example` to `.env` and fill values.
- Start with env loaded:

```bash
npm run start:env
```

EAS / production:

- Use EAS to set secrets so keys are not in source control:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

In production, never commit `.env` or store service_role keys in the client.

2) Install dependencies

Run in `frontend/SHRKs`:

```bash
npm install
npx expo install expo-camera expo-router expo-splash-screen react-native-safe-area-context @supabase/supabase-js
```

3) Run

```bash
npx expo start
```

4) Files added

- `src/lib/supabaseClient.ts` — Supabase client helper
- `src/components/Auth.tsx` — simple sign in / sign up UI using Supabase
- `src/components/PoseDetector.tsx` — camera + placeholder for Mediapipe integration
- `src/app/auth.tsx` and `src/app/pose.tsx` — route pages

5) Mediapipe integration notes

- For accurate, real-time pose detection consider running Mediapipe in a WASM worker (web) or a native module (iOS/Android).
- On web you can use the Mediapipe JS/WASM build and feed frames from a video/canvas.
- On native, evaluate using a dedicated native module or use react-native-vision-camera and a frame processor plugin.
- The `PoseDetector` component contains comments where frame capture and processing should be wired.

If you want, I can wire a minimal Mediapipe web example next, or add native frame-processor notes.
