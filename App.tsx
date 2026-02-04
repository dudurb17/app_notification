import {
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Notifee, {
  AndroidImportance,
  AuthorizationStatus,
  Event,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    async function getNotifications() {
      const notifications = await Notifee.requestPermission();
      if (
        notifications.authorizationStatus === AuthorizationStatus.AUTHORIZED
      ) {
        console.log('User has granted permission', notifications);
        setNotificationPermission(true);
      } else {
        console.log('User has not granted permission');
        setNotificationPermission(false);
      }
    }
    getNotifications();
  }, []);

  // Background: handle press and dismiss events when the app is closed
  Notifee.onBackgroundEvent(async (event: Event) => {
    if (event.type === EventType.DISMISSED) {
      console.log('Notification dismissed from background');
      return;
    }
    if (event.type === EventType.PRESS) {
      if (event.detail?.notification?.id) {
        await Notifee.cancelNotification(event.detail?.notification?.id);
      }
      console.log(
        'Notification pressed from background',
        event?.detail?.notification,
      );
      return;
    }
  });

  useEffect(() => {
    // Foreground: handle press and dismiss events while the app is open
    return Notifee.onForegroundEvent((event: Event) => {
      switch (event.type) {
        case EventType.DISMISSED:
          console.log('Notification dismissed');
          break;
        case EventType.PRESS:
          console.log('Notification pressed', event?.detail?.notification);
          console.log('Notification id', event?.detail?.notification?.id);
          console.log('Notification body', event?.detail?.notification?.body);
          console.log('Notification title', event?.detail?.notification?.title);
          break;
        default:
          break;
      }
    });
  }, []);

  async function sendNotification() {
    if (!notificationPermission) {
      return;
    }

    const channel = await Notifee.createChannel({
      id: 'Test',
      name: 'Test Channel',
      importance: AndroidImportance.HIGH,
    });

    await Notifee.displayNotification({
      title: 'Hello World',
      body: 'This is a test notification',
      android: {
        channelId: channel,
      },
    });
  }

  async function handleScheduleNotification() {
    if (!notificationPermission) {
      return;
    }
    const date = new Date(Date.now());
    date.setMinutes(date.getMinutes() + 1);

    const triggerNotification: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };
    const notification = await Notifee.createTriggerNotification(
      {
        title: 'Hello World in the future',
        body: 'This is a test notification',
        android: {
          channelId: 'Test',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      },
      triggerNotification,
    );
    console.log('Notification', notification);
  }

  async function handleListNotifications() {
    await Notifee.getTriggerNotificationIds().then(ids => {
      console.log('Notifications', ids);
    });
  }

  const handleCancelNotification = async (id: string) => {
    await Notifee.cancelNotification(id);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={{ padding: 10, backgroundColor: 'blue', borderRadius: 5 }}
          onPress={sendNotification}
        >
          <Text style={{ color: 'white' }}>Send Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 10, backgroundColor: 'green', borderRadius: 5 }}
          onPress={handleScheduleNotification}
        >
          <Text style={{ color: 'white' }}>Schedule Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 10, backgroundColor: 'red', borderRadius: 5 }}
          onPress={handleListNotifications}
        >
          <Text style={{ color: 'white' }}>List Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 10, backgroundColor: 'yellow', borderRadius: 5 }}
          onPress={() => handleCancelNotification('ArtOlp7E5pR4NbXiHE4Y')}
        >
          <Text style={{ color: 'white' }}>Cancel Notification</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
