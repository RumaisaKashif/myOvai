import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import CalendarView from '../components/calendar';
import { AuthProvider } from "../../AuthContext";

export default function CycleLoggerScreen() {
  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Cycle Logger</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <AuthProvider>
            <CalendarView />
          </AuthProvider>
        </View>
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
  titleContainer: {
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 25,
    alignItems: "center",
    backgroundColor: "rgba(45, 27, 61, 0.85)", 
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
  pageTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
});