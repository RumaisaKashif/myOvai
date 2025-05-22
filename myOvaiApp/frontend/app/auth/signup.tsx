import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signOut } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebaseConfig';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    setError(null);
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Send verification email
      await sendEmailVerification(user);
      alert('A verification email has been sent to your email address. Please verify before logging in.');
      // Log out the user to prevent access before verification
      await signOut(auth);
    } catch (err) {
      const errorMessage = err instanceof FirebaseError ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.title}>
            <Text style={styles.titleText}>Signup for myOvai</Text>
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
      <Button title="Sign Up" onPress={handleSignUp} />
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
        color: "white",
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
        marginVertical: 4,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});