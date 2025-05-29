import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setUser(user);
      if (!user) {
        router.replace('/auth/login');  // Redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isLoggedIn) {
    // show a loading or empty view while redirecting
    return (
      <LinearGradient
        colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
        style={styles.fullScreen}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>
            Hi, {user?.displayName || user?.email?.split("@")[0] || "User"}!
          </Text>
          <Text style={styles.appTitle}>Welcome to myOvai!</Text>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Add quick stats or cycle info here if needed */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Cycle Overview</Text>
            <Text style={styles.statsText}>Next period starts in 1 day</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Note: renaming this file causes errors

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, 
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 25,
    alignItems: "center",
    backgroundColor: "rgba(45, 27, 61, 0.85)", // Darker purple with transparency to match the nav
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Helvetica",
    marginBottom: 5,
    opacity: 0.9,
  },
  appTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(45, 27, 61, 0.1)',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B3D',
    marginBottom: 10,
    fontFamily: "Helvetica",
  },
  statsText: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: "Helvetica",
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: "rgba(45, 27, 61, 0.85)",
    borderRadius: 25,
    marginBottom: 30,
    width: '40%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: { 
    color: 'white',
    fontSize: 18,
    fontFamily: "Helvetica",
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 20,
  }
});