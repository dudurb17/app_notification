import { Button, StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Notifee, {
  AndroidImportance,
  AuthorizationStatus,
  Event,
  EventType,
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

  useEffect(() => {
    // Foreground: handle press and dismiss events while the app is open
    return Notifee.onForegroundEvent((event: Event) => {
      switch (event.type) {
        case EventType.DISMISSED:
          console.log('Notification dismissed');
          break;
        case EventType.PRESS:
          console.log('Notification pressed', event?.detail?.notification);
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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Send Notification" onPress={sendNotification} />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
