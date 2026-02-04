import { StatusBar, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Notifee, { AuthorizationStatus } from '@notifee/react-native';

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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Hello World</Text>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
