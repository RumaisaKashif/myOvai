import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Chatbot from '../components/chatbot';
import { Text } from 'react-native';

export default function AIChatbotScreen() {
  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>AI Chatbot</Text>
          <Text style={styles.subtitleText}>Your personal menstrual health assistant</Text>
        </View>
        <Chatbot />
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
  titleText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 5,
  },
});