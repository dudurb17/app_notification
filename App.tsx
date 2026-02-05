import {
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Notifee, {
  AndroidImportance,
  AuthorizationStatus,
  Event,
  EventType,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

interface NotificationCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
}

function NotificationCard({
  icon,
  title,
  description,
  onPress,
  color,
  disabled,
}: NotificationCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: color },
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, disabled && styles.textDisabled]}>
            {title}
          </Text>
          <Text
            style={[styles.cardDescription, disabled && styles.textDisabled]}
          >
            {description}
          </Text>
        </View>
      </View>
      <Text style={[styles.chevron, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function getNotifications() {
      const notifications = await Notifee.requestPermission();
      if (
        notifications.authorizationStatus === AuthorizationStatus.AUTHORIZED
      ) {
        setNotificationPermission(true);
      } else {
        setNotificationPermission(false);
      }
    }
    getNotifications();
    updatePendingCount();
  }, []);

  const updatePendingCount = async () => {
    const ids = await Notifee.getTriggerNotificationIds();
    setPendingCount(ids.length);
  };

  Notifee.onBackgroundEvent(async (event: Event) => {
    if (event.type === EventType.DISMISSED) {
      return;
    }
    if (event.type === EventType.PRESS) {
      if (event.detail?.notification?.id) {
        await Notifee.cancelNotification(event.detail?.notification?.id);
      }
      return;
    }
  });

  useEffect(() => {
    return Notifee.onForegroundEvent((event: Event) => {
      switch (event.type) {
        case EventType.DISMISSED:
        case EventType.PRESS:
          updatePendingCount();
          break;
        default:
          break;
      }
    });
  }, []);

  async function sendNotification() {
    if (!notificationPermission) return;

    const channel = await Notifee.createChannel({
      id: 'Test',
      name: 'Test Channel',
      importance: AndroidImportance.HIGH,
    });

    await Notifee.displayNotification({
      title: 'Hello World',
      body: 'This is a test notification',
      android: { channelId: channel },
    });
  }

  async function handleScheduleNotification() {
    if (!notificationPermission) return;

    const date = new Date(Date.now());
    date.setMinutes(date.getMinutes() + 1);

    const triggerNotification: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await Notifee.createTriggerNotification(
      {
        title: 'Scheduled Notification',
        body: 'This notification was scheduled 1 minute ago!',
        android: {
          channelId: 'Test',
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      },
      triggerNotification,
    );
    await updatePendingCount();
  }

  async function handleScheduleWeeklyNotification() {
    if (!notificationPermission) return;

    const date = new Date(Date.now());
    date.setMinutes(date.getMinutes() + 1);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.WEEKLY,
    };

    await Notifee.createTriggerNotification(
      {
        title: 'Weekly Reminder',
        body: 'Your weekly notification is here!',
        android: {
          channelId: 'Test',
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      },
      trigger,
    );
    await updatePendingCount();
  }

  const handleCancelNotificationAll = async () => {
    await Notifee.cancelAllNotifications();
    await updatePendingCount();
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDarkMode ? '#0f0f23' : '#f5f7fa',
    },
    headerGradient: {
      backgroundColor: isDarkMode ? '#1a1a3e' : '#667eea',
    },
    sectionTitle: {
      color: isDarkMode ? '#a0a0c0' : '#64748b',
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isDarkMode ? '#1a1a3e' : '#667eea'}
      />
      <SafeAreaView
        style={[styles.container, dynamicStyles.container]}
        edges={['top', 'bottom']}
      >
        <View style={[styles.header, dynamicStyles.headerGradient]}>
          <Text style={styles.headerIcon}>🔔</Text>
          <Text style={styles.headerTitle}>Notification Manager</Text>
          <Text style={styles.headerSubtitle}>
            Push Notifications with React Native & Notifee
          </Text>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                notificationPermission
                  ? styles.statusEnabled
                  : styles.statusDisabled,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: notificationPermission
                      ? '#22c55e'
                      : '#ef4444',
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {notificationPermission
                  ? 'Permissions Granted'
                  : 'Permissions Required'}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {notificationPermission ? '✓' : '✗'}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            INSTANT NOTIFICATIONS
          </Text>
          <NotificationCard
            icon="⚡"
            title="Send Instant Notification"
            description="Display a notification immediately on the device"
            onPress={sendNotification}
            color="#6366f1"
            disabled={!notificationPermission}
          />

          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            SCHEDULED NOTIFICATIONS
          </Text>
          <NotificationCard
            icon="⏰"
            title="Schedule in 1 Minute"
            description="Set a notification to appear after 1 minute"
            onPress={handleScheduleNotification}
            color="#10b981"
            disabled={!notificationPermission}
          />
          <NotificationCard
            icon="📅"
            title="Weekly Recurring"
            description="Schedule a notification that repeats every week"
            onPress={handleScheduleWeeklyNotification}
            color="#8b5cf6"
            disabled={!notificationPermission}
          />

          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            MANAGEMENT
          </Text>
          <NotificationCard
            icon="🗑️"
            title="Cancel All Notifications"
            description="Remove all pending and scheduled notifications"
            onPress={handleCancelNotificationAll}
            color="#ef4444"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Built with React Native & Notifee
            </Text>
            <Text style={styles.footerSubtext}>
              Local Push Notifications Demo
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusEnabled: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusDisabled: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  textDisabled: {
    color: '#94a3b8',
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});

export default App;
