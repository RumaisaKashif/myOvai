import { Image } from 'expo-image';
import { Platform, StyleSheet, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
// import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CycleLoggerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.titleContainer}>
      <Text style={styles.text}>Cycle Logger</Text>
      </SafeAreaView>
    </SafeAreaView>
  );
}

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
  }
});
