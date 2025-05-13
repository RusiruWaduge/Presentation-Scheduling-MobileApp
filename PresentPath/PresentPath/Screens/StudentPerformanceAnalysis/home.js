import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { account, databases } from '../../Libraries/appwriteConfig';
import { Query } from 'appwrite';

const DATABASE_ID = '67dd8a42000b2f5184aa';
const COLLECTION_ID = '67f22df100281c3981da';

const HomeScreen = ({ navigation }) => {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample Upcoming Projects
  const upcomingProjects = [
    { id: 1, title: 'AI Research Presentation', date: '2025-03-28' },
    { id: 2, title: 'Final Year Project Review', date: '2025-04-05' },
    { id: 3, title: 'Software Demo Submission', date: '2025-04-10' },
  ];

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const user = await account.get();
        if (!user.email) {
          navigation.replace("UserLogin");
        } else {
          fetchStudentDetails(user.email);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigation.replace("UserLogin");
      }
    };

    const fetchStudentDetails = async (email) => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("email", email)]
        );

        if (response.documents.length > 0) {
          setStudentData(response.documents);
        } else {
          setStudentData([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching student details:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to fetch student details.");
      }
    };

    checkLoggedInUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      Alert.alert("Logout Successful", "You have been logged out.");
      navigation.replace('UserLogin');
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header */}
      <Text style={styles.header}>Welcome to Your Dashboard</Text>

      {/* Student Details */}
      {loading ? (
        <Text>Loading student details...</Text>
      ) : studentData.length === 0 ? (
        <Text>No student details found.</Text>
      ) : (
        studentData.map((student, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>👤 Name: {student.firstName} {student.lastName}</Text>
            <Text style={styles.cardText}>🎓 Semester: {student.semester}</Text>
            <Text style={styles.cardText}>🔑 Role: {student.role}</Text>
          </View>
        ))
      )}

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
      <Text style={styles.sectionTitle}>🚀 View Your Performance</Text>
      <View style={styles.featureContainer}>
      {/* Performance Navigation */}
           <TouchableOpacity
             style={styles.button}
             onPress={() => navigation.navigate('StdProfile')}
           >
             <Text style={styles.buttonText}>View Your Performance</Text>
           </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

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
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
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
    elevation: 4,
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
    elevation: 3,
  },
  featureText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#28a745', // Bootstrap-style green
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonText: {
    fontSize: 16,
    color: '#ffffff', // White text on green background
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  }
  
  
});

export default HomeScreen;
