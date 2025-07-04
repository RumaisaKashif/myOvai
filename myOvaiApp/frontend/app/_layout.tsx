// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { StatusBar } from 'expo-status-bar';
// import { Stack } from 'expo-router';
// import { useState, useEffect } from 'react';
// import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { Text, View, ActivityIndicator} from 'react-native'; 
// import { auth } from '../firebaseConfig'

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true); 
//   const [fontsLoaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     // const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setIsLoading(false); 
//     });

//     return () => unsubscribe();
//   }, []);

//   if (isLoading || !fontsLoaded) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="blue" />
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack screenOptions={{ headerShown: false }}>
//           {!user ? (
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           ) : (
//             <>
//               <Stack.Screen name="auth/login" />
//               <Stack.Screen name="auth/signup" />
//             </>
//           )}
//         </Stack>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//   );
// }
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        console.log('hasLaunched value:', hasLaunched); // Debug log
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('User state:', user ? 'Logged in' : 'Not logged in'); // Debug log
      setUser(user);
      setIsLoading(false);
    });

    checkFirstLaunch();

    return () => unsubscribe();
  }, []);

  if (isLoading || !fontsLoaded || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen name="onboarding-screen" options={{ headerShown: false }} />
        ) : !user ? (
          <>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}