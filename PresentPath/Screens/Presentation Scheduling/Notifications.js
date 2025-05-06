import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from 'react-native-vector-icons';
import { format } from 'date-fns'; // Import date-fns for formatting dates

// Import your Appwrite database service to interact with the examiner data
import { GetSchedules } from '../../Libraries/databaseService'; // Adjust the import path as necessary

// Utility function to pad numbers (used in time formatting)
const pad = (num) => num.toString().padStart(2, '0');

// Format a date (assumed to be in "YYYY-MM-DD") as "13 April 2025"
const formatFriendlyDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Updated time formatting function that uses UTC hours/minutes
const formatFriendlyTime = (timeString) => {
  const date = new Date(timeString);
  // If the conversion fails, return the original string.
  if (isNaN(date)) return timeString;
  const hours = date.getUTCHours();      // Use UTC values like in your dashboard
  const minutes = date.getUTCMinutes();
  if (hours === 0 && minutes === 0) return '12:00 AM';
  if (hours === 12 && minutes === 0) return '12:00 PM';
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Function to request notification permissions and get token
  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push notification token:', token.data);
        
        // Store the token in your examiner's document (store this in Appwrite)
        // You would need to use your Appwrite service to update the examiner's token in the database
        // Example: storePushTokenInDatabase(token.data); 
      }
    };

    // Set up listener for notifications when the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prevNotifications => [
        ...prevNotifications,
        notification,
      ]);
    });

    registerForPushNotifications();

    return () => {
      notificationListener.remove();
    };
  }, []);

  // Function to handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  // Function to handle closing of the notification modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  // Function to format the date in a user-friendly format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy hh:mm a'); // Format date as "Aug 21, 2025 12:30 PM"
  };

  // Function to delete a notification
  const deleteNotification = (notification) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(item => item !== notification)
    );
  };

  // Fetch schedules to show notifications for upcoming events for examiners
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedules = await GetSchedules();
        // Filter and display upcoming presentation reminders for the examiner
        const upcomingNotifications = schedules.filter(schedule => {
          const currentDate = new Date();
          const presentationDate = new Date(schedule.date);
          const timeDiff = presentationDate.getTime() - currentDate.getTime();
          
          // If the presentation is in 24 hours, schedule a reminder
          return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0; // 24 hours
        });

        // Map schedules to notifications to be shown
        const reminderNotifications = upcomingNotifications.map(schedule => ({
          request: {
            content: {
              title: `Reminder: Presentation for Group ${schedule.group_id}`,
              body: `The presentation for group ${schedule.group_id} is due tomorrow at ${formatFriendlyTime(schedule.date)}`,
              data: {
                time: schedule.date,  // Store the date for the reminder
              },
            },
          },
        }));

        setNotifications(reminderNotifications);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  // Function to render notification item
  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <TouchableOpacity onPress={() => handleNotificationClick(item)}>
        <Text style={styles.notificationTitle}>{item.request.content.title}</Text>
        <Text style={styles.notificationMessage}>{item.request.content.body}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteNotification(item)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No upcoming reminders</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderNotification}
        />
      )}

      {/* Modal for displaying notification details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification Details</Text>
            <Text style={styles.modalMessage}>{selectedNotification?.request.content.body}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f9fc', // Soft background color
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f4068', // Darker text color for header
  },
  notificationItem: {
    flexDirection: 'row', // Horizontal layout for notifications
    justifyContent: 'space-between', // Add space between text and button
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff', // White background for notifications
    borderRadius: 8,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4068', // Dark blue title for readability
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555', // Lighter color for message text
  },
  deleteButton: {
    backgroundColor: '#ff6347', // Red background for delete button
    padding: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
});

export default NotificationsScreen;