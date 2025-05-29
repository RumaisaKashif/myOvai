import React, { useState, useEffect } from 'react';
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
import { Link, useRouter, useFocusEffect } from 'expo-router';
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

  // Clear error when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setError(null);
    }, [])
  );

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
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📧</Text>
            </View>
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
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.titleText}>Login to myOvai</Text>
            </View>
            
            {/* Login Form */}
            <View style={styles.formContainer}>
              {/* Google Sign-In Button */}
              <TouchableOpacity 
                style={[styles.googleButton, (isLoading || isGoogleLoading) && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {isGoogleLoading ? 'Signing In...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>
              
              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(55, 65, 81, 0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading && !isResetLoading}
                />
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
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
                    placeholderTextColor="rgba(55, 65, 81, 0.6)"
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
              </View>
              
              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword} 
                disabled={isResetLoading}
              >
                <Text style={[styles.forgotPasswordText, isResetLoading && styles.disabledText]}>
                  {isResetLoading ? 'Sending reset email...' : 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, (isLoading || isResetLoading || isGoogleLoading) && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={isLoading || isGoogleLoading || isResetLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Text>
              </TouchableOpacity>
              
              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  Don't have an account?{' '}
                  <Link href="/auth/signup" style={styles.signupLink}>
                    Sign up
                  </Link>
                </Text>
              </View>
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
    backgroundColor: '#E8D5FF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8B5E83',
    marginBottom: 8,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B46C1',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#8B5E83',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#8B5E83',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#8B5E83',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#8B5E83',
    fontWeight: '600',
  },
  // Confirmation screen styles
  confirmationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8D5FF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  confirmationTitle: {
    color: '#374151',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  confirmationSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emailText: {
    color: '#8B5E83',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationButton: {
    backgroundColor: '#8B5E83',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#8B5E83',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});