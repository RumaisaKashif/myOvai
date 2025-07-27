import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const onboardingScreens = [
    {
      title: 'Log Your Cycles',
      description: 'Easily track your menstrual cycles with a few taps. Stay informed about your cycle history and patterns.',
      image: require('../assets/onboarding1.png'),
    },
    {
      title: 'Track Symptoms',
      description: 'Record symptoms like mood changes, cramps, or energy levels to understand your body better.',
      image: require('../assets/onboarding2.png'),
    },
    {
      title: 'Ask Your AI Assistant',
      description: 'Get personalized insights from your AI-powered menstrual health assistant anytime, anywhere.',
      image: require('../assets/onboarding4.png'),
    },
    {
      title: 'View Cycle Predictions',
      description: 'Easily check when your next period is set to begin and plan your days with confidence.',
      image: require('../assets/onboarding3.png'),
    },
  ];

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      router.replace('./(tabs)'); // Navigate to home after onboarding
    }
  };

  const handleSkip = () => {
    router.replace('./(tabs)'); // Skip onboarding and go to home
  };

  return (
    <LinearGradient
      colors={['#E6D7FF', '#D8C7F0', '#E0BBE4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.contentContainer}>
          <Image
            source={onboardingScreens[currentScreen].image}
            style={styles.clipart}
            resizeMode="contain"
            onError={(error) => console.error('Image load error:', error.nativeEvent.error)}
          />
          <View style={styles.card}>
            <Text style={styles.title}>{onboardingScreens[currentScreen].title}</Text>
            <Text style={styles.description}>{onboardingScreens[currentScreen].description}</Text>
          </View>
          <View style={styles.dotsContainer}>
            {onboardingScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentScreen === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <AntDesign name="arrowright" size={24} color="white" />
          </TouchableOpacity>
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  skipText: {
    color: '#2D1B3D',
    fontSize: 16,
    fontFamily: 'Helvetica',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(45, 27, 61, 0.1)',
    marginTop: 0,
  },
  clipart: {
    width: 500,
    height: 400,
    marginBottom: 0,
    shadowColor: '#2D1B3D',
    shadowOffset: { width: 5, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#2D1B3D',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#2D1B3D',
  },
  inactiveDot: {
    backgroundColor: 'rgba(45, 27, 61, 0.3)',
  },
  nextButton: {
    marginTop: 30,
    backgroundColor: '#2D1B3D',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});