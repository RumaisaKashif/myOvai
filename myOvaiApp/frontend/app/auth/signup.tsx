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
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signOut
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';
import { useGoogleAuth } from '../utils/googleAuthService';
import AccountCreatedPopup from '../utils/accountCreatedScreen';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdEmail, setCreatedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Use the Google Auth hook
  const { request, response, handleGoogleAuth, handleGoogleSignIn } = useGoogleAuth();

  // Clear error when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setError(null);
    }, [])
  );

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setIsGoogleLoading(true);
      setError(null);
      
      handleGoogleSignIn(authentication, true).then((result) => {
        if (!result.success && result.error) {
          setError(result.error);
        }
        setIsGoogleLoading(false);
      });
    }
  }, [response]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      
      // Show success popup instead of immediate redirect
      setCreatedEmail(email);
      setShowSuccessPopup(true);
      
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    try {
      const result = await handleGoogleAuth(true);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError('Google sign up failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    // Redirect to login after closing popup
    router.replace('/auth/login');
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Join us today!</Text>
              <Text style={styles.titleText}>Sign Up for myOvai</Text>
            </View>
            
            {/* Sign Up Form */}
            <View style={styles.formContainer}>
              {/* Google Sign-Up Button */}
              <TouchableOpacity 
                style={[styles.googleButton, (isLoading || isGoogleLoading) && styles.disabledButton]}
                onPress={handleGoogleSignUp}
                disabled={!request || isLoading || isGoogleLoading}
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  {isGoogleLoading ? 'Signing Up...' : 'Continue with Google'}
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
                  editable={!isLoading && !isGoogleLoading}
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
                    placeholder="Enter your password (min 6 characters)"
                    placeholderTextColor="rgba(55, 65, 81, 0.6)"
                    secureTextEntry={!showPassword}
                    editable={!isLoading && !isGoogleLoading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                    disabled={isLoading || isGoogleLoading}
                  >
                    <Text style={styles.eyeIcon}>
                      {showPassword ? '👁️' : '🛡️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Sign Up Button */}
              <TouchableOpacity 
                style={[styles.signupButton, (isLoading || isGoogleLoading) && styles.disabledButton]} 
                onPress={handleEmailSignUp}
                disabled={isLoading || isGoogleLoading}
              >
                <Text style={styles.signupButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
              
              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Already have an account?{' '}
                  <Link href="/auth/login" style={styles.loginLink}>
                    Log in
                  </Link>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Account Created Popup */}
      <AccountCreatedPopup
        visible={showSuccessPopup}
        onClose={handleClosePopup}
        email={createdEmail}
      />
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
    marginBottom: 43,
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
  signupButton: {
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
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#8B5E83',
    fontWeight: '600',
  },
});