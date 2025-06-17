// import * as Notifications from 'expo-notifications';
// import { predictCycleDates } from './period-prediction';

// export async function scheduleLocalNotification(userId: string, username: string) {
//   try {
//     const { ovulationDate, menstrualDate } = await predictCycleDates(userId);
//     const now = new Date();
//     const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

//     if (ovulationDate) {
//       const ovulationTrigger = new Date(ovulationDate.getTime() - threeDaysInMs);
//       if (ovulationTrigger > now) {
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: 'Fertile Window Reminder',
//             body: `Hi ${username}! Your fertile window starts in 3 days! Track symptoms and plan accordingly.`,
//           },
//           trigger: { date: ovulationTrigger },
//         });
//       }
//     }

//     if (menstrualDate) {
//       const menstrualTrigger = new Date(menstrualDate.getTime() - threeDaysInMs);
//       if (menstrualTrigger > now) {
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: 'Period Reminder',
//             body: `Hi ${username}! Your period is expected to start in 3 days. Prepare with pads, tampons, or your usual supplies.`,
//           },
//           trigger: { date: menstrualTrigger },
//         });
//       }
//     }
//   } catch (error) {
//     console.error('Error scheduling notifications:', error);
//   }
// }
import * as Notifications from 'expo-notifications';
import { predictCycleDates } from './period-prediction';

export async function scheduleLocalNotification(userId: string, username: string) {
  try {
    const { ovulationDate, menstrualDate } = await predictCycleDates(userId);
    const now = new Date();
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    if (ovulationDate) {
      const ovulationTrigger = new Date(ovulationDate.getTime() - threeDaysInMs);
      if (ovulationTrigger > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Fertile Window Reminder',
            body: `Hi ${username}! Your fertile window starts in 3 days! Track symptoms and plan accordingly.`,
          },
          trigger: { date: ovulationTrigger, type: 'date' } as Notifications.DateTriggerInput, // Added 'type: "date"'
        });
      }
    }

    if (menstrualDate) {
      const menstrualTrigger = new Date(menstrualDate.getTime() - threeDaysInMs);
      if (menstrualTrigger > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Period Reminder',
            body: `Hi ${username}! Your period is expected to start in 3 days. Prepare with pads, tampons, or your usual supplies.`,
          },
          trigger: { date: menstrualTrigger, type: 'date' } as Notifications.DateTriggerInput, // Added 'type: "date"'
        });
      }
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}
