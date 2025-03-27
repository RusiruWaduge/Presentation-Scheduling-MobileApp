import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

const HomeScreen = () => {
  // Sample Upcoming Projects
  const upcomingProjects = [
    { id: 1, title: 'AI Research Presentation', date: '2025-03-28' },
    { id: 2, title: 'Final Year Project Review', date: '2025-04-05' },
    { id: 3, title: 'Software Demo Submission', date: '2025-04-10' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header */}
      <Text style={styles.header}>Welcome to Your Dashboard</Text>

      {/* Upcoming Projects Section */}
      <Text style={styles.sectionTitle}>📅 Upcoming Projects</Text>
      {upcomingProjects.map((project) => (
        <Card key={project.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{project.title}</Text>
            <Text style={styles.cardDate}>{project.date}</Text>
          </Card.Content>
        </Card>
      ))}

      {/* Calendar Section */}
      <Text style={styles.sectionTitle}>📆 Calendar</Text>
      <Calendar
        markedDates={{
          '2025-03-28': { marked: true, dotColor: 'blue' },
          '2025-04-05': { marked: true, dotColor: 'blue' },
          '2025-04-10': { marked: true, dotColor: 'blue' },
        }}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#007bff',
          todayTextColor: '#007bff',
          arrowColor: '#007bff',
        }}
      />

      {/* Features Section */}
      <Text style={styles.sectionTitle}>🚀 Features</Text>
      <View style={styles.featureContainer}>
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureText}>📅 Schedule Presentation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureText}>👥 Manage Participants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureText}>📊 View Reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#007bff',
  },
  card: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 4, // Adds shadow effect
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  calendar: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    elevation: 4, // Shadow effect
  },
  featureContainer: {
    marginTop: 10,
    gap: 10,
  },
  featureButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3, // Button shadow effect
  },
  featureText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;