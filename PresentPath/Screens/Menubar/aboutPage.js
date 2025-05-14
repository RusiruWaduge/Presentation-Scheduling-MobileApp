import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const AboutPage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/logo.png')} // Optional: your app logo
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>About PresentPath</Text>

      <Text style={styles.tagline}>Paves the way for a clear,timed presentation journey.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Our Mission</Text>
        <Text style={styles.sectionText}>
          At PresentPath, we are committed to revolutionizing the way student presentations are scheduled, tracked, and evaluated. Our AI-powered system ensures smart rescheduling, fair evaluations, and real-time feedback — all in one place.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Why PresentPath?</Text>
        <Text style={styles.sectionText}>
          • Automated Scheduling & Rescheduling{'\n'}
          • Examiner Availability Handling{'\n'}
          • Real-time Notifications & Reminders{'\n'}
          • AI-Generated Feedback & Performance Reports
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Who We Are</Text>
        <Text style={styles.sectionText}>
          We are a passionate team of students and developers who believe that academic presentations should be seamless and impactful. PresentPath is our effort to bridge that gap using technology and thoughtful design.
        </Text>
      </View>

      <Text style={styles.footer}>© 2025 PresentPath. All rights reserved.</Text>
    </ScrollView>
  );
};

export default AboutPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F8FF',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    backgroundColor: '#E6F0FA',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#003366',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    color: '#888',
    marginTop: 30,
    marginBottom: 10,
  },
});
