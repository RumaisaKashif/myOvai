// Google sign in error has been dealt with for expo go
import { useEffect } from 'react';
import { signInWithCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    // iosClientId: '676509692331-fhlmlsfutai7b52ml33ffb0gjel4nc91.apps.googleusercontent.com', // use for actual IOS deployment
    iosClientId: '676509692331-3u9rd26trdaffg1omjilt5klv52b9q6a.apps.googleusercontent.com', // temporarily equate to webid for expo go compatibility
    webClientId: '676509692331-3u9rd26trdaffg1omjilt5klv52b9q6a.apps.googleusercontent.com',
    androidClientId: '676509692331-3u9rd26trdaffg1omjilt5klv52b9q6a.apps.googleusercontent.com',
    // androidClientId: undefined, // Skip android for now
    redirectUri: Platform.OS !== 'web' ? 'https://auth.expo.io/@rumaisakashif/myOvaiApp' : undefined, // Your username
    scopes: ['profile', 'email'],
  });

  const handleGoogleSignIn = async (authentication: any, isSignUp: boolean = false) => {
    try {
      const { idToken } = authentication;
      const credential = GoogleAuthProvider.credential(idToken);
      
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      console.log('Google Sign-In successful:', user.uid);
      router.replace('/(tabs)');
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'Google Sign-In failed';
      console.error('Google Sign-In error:', err);
      return { success: false, error: errorMessage };
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean = false): Promise<{ success: boolean; error?: string; user?: any }> => {
    if (Platform.OS === 'web') {
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        console.log('Google Sign-In (web) successful:', user.uid);
        router.replace('/(tabs)');
        return { success: true, user };
      } catch (err) {
        const errorMessage = err instanceof FirebaseError ? err.message : 'Google Sign-In failed';
        console.error('Google Sign-In (web) error:', err);
        return { success: false, error: errorMessage };
      }
    }

    if (!request) {
      console.error('Google Auth request not ready');
      return { success: false, error: 'Authentication not ready' };
    }
    try {
      console.log('Initiating Google Auth with redirect URI:', 'https://auth.expo.io/@rumaisakashif/myOvaiApp');
      const result = await promptAsync();
      if (result?.type === 'success') {
        return await handleGoogleSignIn(result.authentication, isSignUp);
      }
      return { success: false, error: 'Authentication cancelled' };
    } catch (err) {
      console.error('Failed to initiate Google Auth:', err);
      return { success: false, error: 'Failed to initiate Google Auth' };
    }
  };

  useEffect(() => {
    if (response && Platform.OS !== 'web') {
      console.log('Google Auth response:', JSON.stringify(response, null, 2));
      if (response.type === 'success' && response.authentication) {
        handleGoogleSignIn(response.authentication);
      } else if (response.type === 'error') {
        console.error('Google Auth error:', response.error);
      }
    }
  }, [response]);

  return {
    request,
    response,
    handleGoogleAuth,
    handleGoogleSignIn,
  };
};