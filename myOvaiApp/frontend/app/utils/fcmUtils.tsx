// import * as Notifications from 'expo-notifications';
// import { getFirestore, doc, setDoc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// // Configure notification permissions
// async function configureNotifications() {
//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') {
//     console.log('Notification permissions not granted');
//     return null;
//   }
//   return await Notifications.getExpoPushTokenAsync();
// }

// // Store FCM token in Firestore
// async function storeFCMToken(userId: string) {
//   const token = await configureNotifications();
//   if (token) {
//     const db = getFirestore();
//     await setDoc(doc(db, 'users', userId), { fcmToken: token.data }, { merge: true });
//     console.log('FCM token stored:', token.data);
//     return token.data;
//   }
//   return null;
// }

// // Call this after user login
// export async function registerForPushNotifications() {
//   const auth = getAuth();
//   const user = auth.currentUser;
//   if (user) {
//     await storeFCMToken(user.uid);
//   }
// }
import * as Notifications from 'expo-notifications';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

async function configureNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'myovai'
    });
    return token.data;
}

async function storeFCMToken(userId: string) {
    try {
        const token = await configureNotifications();
        if (token) {
        const db = getFirestore();
        await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
        console.log('FCM token stored:', token);
        return token;
        }
    } catch (error) {
        console.error('Error storing FCM token:', error);
    }
    return null;
}

export async function registerForPushNotifications() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        await storeFCMToken(user.uid);
    } else {
        console.log('No user logged in');
    }
}