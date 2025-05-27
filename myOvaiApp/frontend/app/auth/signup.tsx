import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signOut
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';
import { useGoogleAuth } from '../utils/googleAuthService';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Use the Google Auth hook
  const { request, response, handleGoogleAuth, handleGoogleSignIn } = useGoogleAuth();

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setIsLoading(true);
      setError(null);
      
      handleGoogleSignIn(authentication, true).then((result) => {
        if (!result.success && result.error) {
          setError(result.error);
        }
        setIsLoading(false);
      });
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
      router.replace('../(tabs)');
      
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await handleGoogleAuth(true);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.title}>
              <Text style={styles.titleText}>Signup for myOvai</Text>
            </View>
            
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#602495',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
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
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "grey",
    color: "white",
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 16,
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