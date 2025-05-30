import { View, Text, Platform, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SymptomLoggerScreen() {
  const symptoms = [
    { name: 'Cramps', icon: '🤕' },
    { name: 'Headache', icon: '😫' },
    { name: 'Mood Swings', icon: '😔' },
    { name: 'Bloating', icon: '🤰' },
    { name: 'Fatigue', icon: '😴' },
    { name: 'Acne', icon: '😤' },
    { name: 'Tender Breasts', icon: '💔' },
    { name: 'Back Pain', icon: '😣' },
  ];

  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Symptom Logger</Text>
          <Text style={styles.subtitleText}>Track how you're feeling today</Text>
        </View>
        
        <ScrollView style={styles.contentContainer}>
          <View style={styles.symptomsGrid}>
            {symptoms.map((symptom, index) => (
              <TouchableOpacity key={index} style={styles.symptomCard}>
                <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                <Text style={styles.symptomName}>{symptom.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesPlaceholder}>Tap to add notes about how you're feeling...</Text>
            </View>
          </View>
        </ScrollView>
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
  titleText: {
    color: 'white',
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textAlign: 'center',
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Helvetica",
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  symptomCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    marginBottom: 15,
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
  symptomIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1B3D',
    fontFamily: "Helvetica",
    textAlign: 'center',
  },
  notesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B3D',
    marginBottom: 15,
    fontFamily: "Helvetica",
    paddingHorizontal: 5,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    minHeight: 100,
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
  notesPlaceholder: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: "Helvetica",
    opacity: 0.6,
    fontStyle: 'italic',
  },
});