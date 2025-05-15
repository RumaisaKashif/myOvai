import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.titleContainer}>
        <Text style={styles.text}>Welcome to myOvai!</Text>
      </SafeAreaView>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Note: renaming this file causes errors

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: "#9169BF",
  },
  text: {
    marginTop: 40,
    alignItems: 'center',//horizontally centre
    justifyContent: 'center',//vertically centre
    color: 'white',
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Helvetica",
  },
  titleContainer: {
    position: 'absolute',
    width: '100%',
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: "center",
    padding: 10, // Space around the text inside the box
    backgroundColor: "#602495",
    borderWidth: 1, // Border thickness
    borderBottomColor: "white", // Border color
  },
  logoutButton: {
    backgroundColor: "#602495",
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    width: '10%',
    alignItems: 'center',
  },
  logoutText: { 
    color: 'white',
    fontSize: 20,
    fontFamily: "Helvetica",
    padding: 10,
    alignItems: "center"
  }
});
