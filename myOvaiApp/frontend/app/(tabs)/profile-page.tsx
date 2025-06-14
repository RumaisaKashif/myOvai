import { TouchableOpacity, Text, View, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, updateProfile, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [useremail, setUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const router = useRouter();

  // Load current user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName ?? '');
        setUserEmail(user.email ?? '');
        setPhotoURL(user.photoURL ?? null); // Load profile photo
      } else {
        router.replace('/auth/login'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Validate email address format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle saving username changes
  const handleSave = async () => {
    if (!username?.trim()) {
      setError('Username cannot be empty.');
      console.log('Trying to save with empty username.');
      return;
    }

    if (!auth.currentUser) {
      setError('No user is currently signed in.');
      router.replace('/auth/login');
      console.log('No user logged in.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: username,
      });
      console.log('Profile updated successfully.');
      router.replace('../(tabs)');
    } catch (err) {
      setError('Failed to update profile. Please try again later.');
      console.log('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!useremail) {
      setError('Email is not available.');
      return;
    }

    if (!validateEmail(useremail)) {
      setError('Invalid email address.');
      return;
    }

    setError(null);
    setIsResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, useremail);
      setShowResetConfirmation(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.log('Password reset error:', err);
    } finally {
      setIsResetLoading(false);
    }
  };

  // Dismiss password reset confirmation
  const dismissResetConfirmation = () => {
    setShowResetConfirmation(false);
  };

  // Password reset confirmation UI
  if (showResetConfirmation) {
    return (
      <LinearGradient
        colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
        style={styles.container}
      >
        <SafeAreaView style={[styles.safeArea, styles.centeredSafeArea]}>
          <View style={styles.confirmationContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
            </View>
            <Text style={styles.confirmationTitle}>Password Reset Email Sent</Text>
            <Text style={styles.confirmationText}>
              We've sent a password reset link to:
            </Text>
            <Text style={styles.emailText}>{useremail}</Text>
            <Text style={styles.confirmationSubtext}>
              Please check your email and follow the instructions to reset your password.
              If you don't see the email, check your spam folder.
            </Text>
            <TouchableOpacity
              style={styles.confirmationButton}
              onPress={dismissResetConfirmation}
            >
              <Text style={styles.buttonText}>Back to Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Your Profile</Text>
        </View>
        {/* Space for profile photo */}
        <View style={styles.photoPlaceholder}></View>
        <View style={styles.formContainer}>
          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError(null);
              }}
              placeholder="Enter your username e.g. johndoe"
              placeholderTextColor="rgba(55, 65, 81, 0.6)"
              autoCapitalize="none"
              editable={!isLoading && !isResetLoading}
            />
          </View>
          {/* User Email */}
          <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.input}>
                  <Text style = {styles.credentials}>
                    {useremail}
                  </Text>
                </View>
          </View>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {/* Done Button */}
          <TouchableOpacity
            style={[styles.doneButton, (isLoading || isResetLoading) && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading || isResetLoading}
          >
            <Text style={styles.doneButtonText}>
              {isLoading ? 'Saving...' : 'Done'}
            </Text>
          </TouchableOpacity>
          {/* Reset Password Button */}
          <TouchableOpacity
            style={[styles.resetPasswordContainer, { marginTop: 10 }]}
            onPress={handleResetPassword}
            disabled={isResetLoading || isLoading}
          >
            <Text style={[styles.resetPasswordText, (isResetLoading || isLoading) && styles.disabledText]}>
              {isResetLoading ? 'Sending reset email...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  centeredSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(45, 27, 61, 0.85)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pageTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  photoPlaceholder: {
    height: '20%',
    width: '100%',
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
    width: '80%',
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
  credentials: {
    fontSize: 16,
    color: 'grey',
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
  doneButton: {
    backgroundColor: '#8B5E83',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#8B5E83',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: "rgba(45, 27, 61, 0.85)",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#8B5E83',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
    marginTop: 30,
    width: '80%'
  },
  logoutText: { 
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetPasswordContainer: {
    alignItems: 'flex-end',
  },
  resetPasswordText: {
    color: '#8B5E83',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    opacity: 0.6,
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
    backgroundColor: '#DCFCE7',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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