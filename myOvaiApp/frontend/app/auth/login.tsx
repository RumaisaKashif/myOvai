import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from '@firebase/app';
import { auth } from '../../firebaseConfig';
import { useGoogleAuth } from '../utils/googleAuthService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [showPasswordResetMessage, setShowPasswordResetMessage] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { handleGoogleAuth } = useGoogleAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
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
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const user = credentials.user;
      if (!user.emailVerified) {
        setError('Please verify your email to login.');
        setShowVerificationMessage(true);
        await auth.signOut();
        setIsLoading(false);
        return;
      }
      console.log('Login successful.');
      router.replace('../(tabs)');
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? 'Authentication error.' : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    
    try {
      const result = await handleGoogleAuth(false); // false = login
      if (!result.success) {
        setError(result.error || 'Google login failed');
      }
      // success handled in hook (redirect)
    } catch {
      setError('Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsResetLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmail(email);
      setShowPasswordResetMessage(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            setError('No account found with this email address.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/too-many-requests':
            setError('Too many requests. Please try again later.');
            break;
          default:
            setError('Failed to send password reset email. Please try again.');
        }
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsResetLoading(false);
    }
  };

  const dismissVerificationMessage = () => {
    setShowVerificationMessage(false);
    setError(null);
  };

  const dismissPasswordResetMessage = () => {
    setShowPasswordResetMessage(false);
    setResetEmail('');
  };

  // Email Verification Confirmation Screen
  if (showVerificationMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationTitle}>Email Verification Required</Text>
            <Text style={styles.confirmationText}>
              Please check your email and click the verification link before logging in.
            </Text>
            <Text style={styles.confirmationSubtext}>
              Didn't receive the email? Check your spam folder or contact support.
            </Text>
            <TouchableOpacity 
              style={styles.confirmationButton}
              onPress={dismissVerificationMessage}
            >
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Password Reset Confirmation Screen
  if (showPasswordResetMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationTitle}>Password Reset Email Sent</Text>
            <Text style={styles.confirmationText}>
              We've sent a password reset link to:
            </Text>
            <Text style={styles.emailText}>{resetEmail}</Text>
            <Text style={styles.confirmationSubtext}>
              Please check your email and follow the instructions to reset your password.
              If you don't see the email, check your spam folder.
            </Text>
            <TouchableOpacity 
              style={styles.confirmationButton}
              onPress={dismissPasswordResetMessage}
            >
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
                <Text style={styles.titleText}>Login to myOvai</Text>
              </View>
              
              {/* Google Sign-Up Button - Prominently placed */}
              <View style={styles.googleButtonContainer}>
                <TouchableOpacity 
                  style={[styles.googleButton, isLoading && styles.disabledButton]}
                  onPress={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                >
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>
                    {isGoogleLoading ? 'Signing In...' : 'Sign In with Google'}
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
                editable={!isLoading && !isResetLoading}
              />
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  editable={!isLoading && !isResetLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={togglePasswordVisibility}
                  disabled={isLoading || isResetLoading}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '🛡️'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Forgot Password Link */}
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={handleForgotPassword} disabled={isResetLoading}>
                  <Text style={[styles.forgotPasswordText, isResetLoading && styles.disabledText]}>
                    {isResetLoading ? 'Sending reset email...' : 'Forgot Password?'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {error && <Text style={styles.error}>{error}</Text>}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.emailButton, (isLoading || isResetLoading) && styles.disabledButton]} 
                  onPress={handleLogin}
                  disabled={isLoading || isGoogleLoading || isResetLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Logging In...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.linksContainer}>
                <Text style={styles.linkText}>
                  Don't have an account?{' '}
                  <Link href="/auth/signup" style={styles.link}>
                    Sign up
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
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "grey",
      borderWidth: 1,
      borderRadius: 4,
      marginBottom: 16,
    },
    passwordInput: {
      flex: 1,
      color: "white",
      padding: 12,
      fontSize: 16,
    },
    eyeButton: {
      padding: 12,
      paddingLeft: 8,
    },
    eyeIcon: {
      fontSize: 20,
      color: 'white',
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginBottom: 16,
    },
    forgotPasswordText: {
      color: '#ADD8E6',
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    disabledText: {
      opacity: 0.6,
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
    // Confirmation screen styles
    confirmationContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    confirmationTitle: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    confirmationText: {
      color: 'white',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 22,
    },
    confirmationSubtext: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    emailText: {
      color: '#ADD8E6',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    confirmationButton: {
      backgroundColor: '#4A90E2',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      minWidth: 150,
    },
  });