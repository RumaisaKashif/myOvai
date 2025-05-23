import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signInWithCredential } from 'firebase/auth';
import { FirebaseError } from '@firebase/app';
import { auth } from '../../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
            
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              placeholder="Enter your email"
              placeholderTextColor="#cccccc"
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
              placeholderTextColor="#cccccc"
              secureTextEntry
              editable={!isLoading}
            />
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
            
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
  loginButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Helvetica",
    marginVertical: 4,
  },
  link: {
    color: '#87CEFB',
    textDecorationLine: 'underline',
  },
  disabledLink: {
    color: 'gray',
  },
});