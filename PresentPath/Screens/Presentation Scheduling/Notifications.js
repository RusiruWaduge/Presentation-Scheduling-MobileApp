import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from 'react-native-vector-icons';

// Import your Appwrite database service to interact with the examiner data
import { GetSchedules } from '../../Libraries/databaseService'; // Adjust the import path as necessary

// ----- Helper functions for formatting date and time -----
const pad = (num) => num.toString().padStart(2, '0');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

// NotificationsScreen component
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Request notification permissions and set up notification listener
  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push notification token:', token.data);
      }
    };

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    registerForPushNotifications();

    return () => {
      notificationListener.remove();
    };
  }, []);

  // Handle notification click to show details in a modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  // Close the notification modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  // Fetch schedules and map them as notifications
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedules = await GetSchedules();
        const upcomingNotifications = schedules.filter((schedule) => {
          const currentDate = new Date();
          const presentationDate = new Date(schedule.date);
          const timeDiff = presentationDate.getTime() - currentDate.getTime();
          return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0;
        });

        // Map the upcoming schedules to notification objects
        const reminderNotifications = upcomingNotifications.map((schedule) => {
          const dateTimeString = schedule.time 
            ? `${schedule.date}T${schedule.time}` 
            : schedule.date;

          return {
            request: {
              content: {
                title: `Reminder: Presentation for Group ${schedule.group_id}`,
                body: (
                  <>
                    The presentation for group {schedule.group_id} is due{" "}
                    <Text style={styles.redText}>tomorrow</Text>.
                  </>
                ),
                data: {
                  time: schedule.date, // Storing the date for the reminder
                },
              },
            },
          };
        });

        setNotifications(reminderNotifications);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  // Delete a notification from the list
  const deleteNotification = (notification) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((item) => item !== notification)
    );
  };

  // Render a single notification item
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

      {/* Modal to display notification details */}
      <Modal
        visible={modalVisible}
        transparent
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
    backgroundColor: '#f4f9fc',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f4068',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
    position: 'relative',
    paddingRight: 50,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4068',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: [{ translateY: -15 }],
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
  redText: {
    color: 'red',
  },
});

export default NotificationsScreen;
