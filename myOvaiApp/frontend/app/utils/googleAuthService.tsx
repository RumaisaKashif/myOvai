import React from 'react';
import { signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const router = useRouter();

  // Configure Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '676509692331-6o22kt8h7bphpnlsco4og0ifcrem11vm.apps.googleusercontent.com',
    iosClientId: '676509692331-fhlmlsfutai7b52ml33ffb0gjel4nc91.apps.googleusercontent.com',
    webClientId: '676509692331-3u9rd26trdaffg1omjilt5klv52b9q6a.apps.googleusercontent.com',
  });

  const handleGoogleSignIn = async (authentication: any, isSignUp: boolean = false) => {
    try {
      const { idToken, accessToken } = authentication;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      if (isSignUp) {
        // For sign-up, redirect to main app (tabs)
        router.replace('../(tabs)');
      } else {
        // For sign-in, redirect to main app (tabs)
        router.replace('../(tabs)');
      }
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'Google authentication failed';
      return { success: false, error: errorMessage };
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean = false): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        return await handleGoogleSignIn(result.authentication, isSignUp);
      }
      return { success: false, error: 'Authentication cancelled' };
    } catch (err) {
      return { success: false, error: 'Failed to initiate Google authentication' };
    }
  };

  return {
    request,
    response,
    handleGoogleAuth,
    handleGoogleSignIn,
  };
};