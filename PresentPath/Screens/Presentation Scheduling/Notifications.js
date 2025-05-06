import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Simulate fetching notifications from an API or local storage
        const fetchNotifications = async () => {
            const mockNotifications = [
                { id: '1', title: 'Reschedule Request', message: 'A student requested to reschedule Presentation 101.', type: 'reschedule' },
                { id: '2', title: 'Reminder', message: 'Presentation 202 starts in 30 minutes.', type: 'reminder' },
                { id: '3', title: 'System Update', message: 'A new feature has been added.', type: 'general' },
            ];
            setNotifications(mockNotifications);
        };

        fetchNotifications();
    }, []);

    const renderNotification = ({ item }) => (
        <TouchableOpacity style={[styles.notificationCard, styles[`notification_${item.type}`]]}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf6f9',
        padding: 16,
    },
    header: {
        fontSize: 26,
        fontWeight: '600',
        color: '#023047',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        paddingBottom: 16,
    },
    notificationCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#d9d9d9',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    notification_reschedule: {
        backgroundColor: '#ffcbcb',
        borderColor: '#ff6f6f',
    },
    notification_reminder: {
        backgroundColor: '#cdeff5',
        borderColor: '#3ba7d1',
    },
    notification_general: {
        backgroundColor: '#e5e5e5',
        borderColor: '#999999',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    notificationMessage: {
        fontSize: 15,
        color: '#555',
    },
});

export default Notifications;