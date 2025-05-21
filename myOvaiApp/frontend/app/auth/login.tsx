import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signInWithCredential } from 'firebase/auth';
import { FirebaseError } from '@firebase/app';
import { auth } from '../../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
        setError('Email and password are required.');
        return;
    }
    if (!validateEmail(email)) {
        setError('Please enter a valid email address (e.g., user@example.com).');
        return;
    }
    try {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        const user = credentials.user;
        if (!user.emailVerified) {
            setError('Please verify your email to login.');
            await auth.signOut();
            return;
        }
        console.log('Login successful.');
        router.replace('../(tabs)');
    } catch (err) {
        const errorMessage = err instanceof FirebaseError ? 'Authentication error.' : 'An unknown error occurred';
        setError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.title}>
            <Text style={styles.titleText}>Login to myOvai</Text>
        </SafeAreaView>
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
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={styles.link}>
            Sign up
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    title: { 
        marginBottom: 200,
        alignItems: 'center'
    },
    titleText: { 
        marginBottom: 200,
        color: "white",
        fontSize: 30,
        alignItems: "center",
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
        borderWidth: 1,
        padding: 8,
        marginBottom: 16,
        borderRadius: 4,
    },
    error: {
        color: 'red',
        marginBottom: 16,
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