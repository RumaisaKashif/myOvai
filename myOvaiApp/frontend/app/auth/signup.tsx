import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signOut,
    signInWithCredential,
    GoogleAuthProvider 
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Configure Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '676509692331-fhlmlsfutai7b52ml33ffb0gjel4nc91.apps.googleusercontent.com',
    webClientId: '676509692331-3u9rd26trdaffg1omjilt5klv52b9q6a.apps.googleusercontent.com'
  });

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication);
    }
  }, [response]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSignUp = async () => {
    setError(null);
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Log out the user to prevent access before verification
      await signOut(auth);
      
      // Automatically redirect to login page
      router.replace('/auth/login');
      
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (authentication: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { idToken, accessToken } = authentication;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Sign out the user after successful registration
      await signOut(auth);
      
      // Automatically redirect to login page without alert
      router.replace('/auth/login');
      
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'Google sign-up failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await promptAsync();
    } catch (err) {
      setError('Failed to initiate Google sign-up');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.title}>
        <Text style={styles.titleText}>Signup for myOvai</Text>
      </SafeAreaView>
      
      {/* Google Sign-Up Button - Prominently placed */}
      <View style={styles.googleButtonContainer}>
        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.disabledButton]}
          onPress={handleGoogleSignUp}
          disabled={!request || isLoading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Signing Up...' : 'Sign up with Google'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH EMAIL</Text>
        <View style={styles.dividerLine} />
      </View>
      
      {/* Email/Password Section */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null);
        }}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        placeholder="Enter your password"
        secureTextEntry
        editable={!isLoading}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.emailButton, isLoading && styles.disabledButton]} 
          onPress={handleEmailSignUp}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing Up...' : 'Sign Up with Email'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>
          Already have an account?{' '}
          <Link href="/auth/login" style={styles.link}>
            Login
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { 
    marginBottom: 50,
    alignItems: 'center'
  },
  titleText: { 
    color: "white",
    fontSize: 30,
    textAlign: "center",
  },
  googleButtonContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  container: {
    backgroundColor: '#602495',
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "grey",
    color: "white",
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  emailButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
    opacity: 0.5,
  },
  dividerText: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 14,
  },
  linksContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: "white",
    fontSize: 14,
    marginVertical: 4,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
