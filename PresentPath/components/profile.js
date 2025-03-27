import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { generateFeedback } from './gemini'; // Assuming generateFeedback is a function to generate feedback
import TopBar from './topBar';

// Appwrite imports
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('67dd8453002a601838ad');
const databases = new Databases(client);

const Profile = () => {
  const [selectedYear, setSelectedYear] = useState('overall');
  const [feedbackData, setFeedbackData] = useState({});
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const databaseId = '67dd8a42000b2f5184aa'; // Your database ID
  const marksCollectionId = '67e012b2000fd11e41fb'; // Your marks collection ID

  // Fetch marks from Appwrite database
  const fetchMarks = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        databaseId,
        marksCollectionId,
      );
      console.log('Fetched Marks:', response.documents);
      setMarks(response.documents);
    } catch (error) {
      console.error('Error fetching marks:', error);
      Alert.alert('Error', `Failed to fetch marks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  // Fetch feedback based on year selection
  const fetchFeedback = useCallback(async (selectedYear) => {
    try {
      const filteredMarks = marks.filter((mark) =>
        selectedYear === 'overall' ? true : mark.Year.toString() === selectedYear.replace('year', '')
      );
      
  
      if (filteredMarks.length === 0) {
        setFeedbackData((prevState) => ({
          ...prevState,
          [selectedYear]: {
            feedback: 'No feedback available.',
            examiner: 'N/A',
            status: 'N/A'
          }
        }));
        return;
      }
  
      const feedback = await generateFeedback(filteredMarks, selectedYear === 'overall');
  
      setFeedbackData((prevState) => ({
        ...prevState,
        [selectedYear]: {
          feedback,
          examiner: 'Prof. Smith',
          status: 'Reviewed',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
        },
      }));
    } catch (error) {
      Alert.alert('Error', `Failed to generate feedback: ${error.message}`);
    }
  }, [marks]);
  

  useEffect(() => {
    fetchFeedback(selectedYear); // Fetch feedback whenever the selected year changes
  }, [selectedYear, fetchFeedback]);

  const currentData = feedbackData[selectedYear] || {};

  const filteredMarks = marks.filter((mark) =>
    selectedYear === 'overall' ? true : mark.Year.toString() === selectedYear.replace('year', '')
  );
  
  const getSemesterMarks = (semester) => {
    return filteredMarks.filter((mark) => mark.Semester.toString() === semester);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Student Number: {item.Student_no || 'N/A'}</Text>
      <Text style={styles.text}>Score: {item.Content_Quality || 'N/A'}</Text>
      <Text style={styles.text}>Presentation Skills: {item.Presentation_Skills || 'N/A'}</Text>
      <Text style={styles.text}>Slide Design: {item.Slide_Design || 'N/A'}</Text>
      <Text style={styles.text}>Engagement: {item.Engagement_And_Interaction || 'N/A'}</Text>
      <Text style={styles.text}>Time Management: {item.Time_Management || 'N/A'}</Text>
      <Text style={styles.text}>Year: {item.Year || 'N/A'}</Text>
      <Text style={styles.text}>Semester: {item.Semester || 'N/A'}</Text>
      <Text style={styles.text}>Presentation Type: {item.Presentation || 'N/A'}</Text>
    </View>
  );
  

  return (
    <ScrollView style={styles.container}>
      <TopBar title="Student Performance" />

      {/* Header */}
      <Text style={styles.performanceHeader}>Student Performance Management</Text>

      {/* Year Selection Buttons */}
      <View style={styles.buttonContainer}>
        {['year1', 'year2', 'year3', 'year4', 'overall'].map((year, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedYear(year)}
            style={[
              styles.yearButton,
              selectedYear === year && styles.activeButton,
            ]}
          >
            <Text style={[styles.buttonText, selectedYear === year && styles.activeButtonText]}>
              {year === 'overall' ? 'Overall' : `Year ${index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.sectionTitle}>Feedback:</Text>
        <Text style={styles.feedbackText}>
          {currentData.feedback || 'No feedback available for this year.'}
        </Text>
        <Text style={styles.examiner}>Examiner: {currentData.examiner || 'N/A'}</Text>
        <Text style={styles.status}>Status: {currentData.status || 'N/A'}</Text>
        <Text style={styles.date}>
          Created: {currentData.$createdAt ? new Date(currentData.$createdAt).toLocaleString() : 'N/A'}
        </Text>
        <Text style={styles.date}>
          Updated: {currentData.$updatedAt ? new Date(currentData.$updatedAt).toLocaleString() : 'N/A'}
        </Text>
      </View>

      {/* Marks List Section */}
      <View style={styles.marksContainer}>
        <Text style={styles.marksHeader}>Student Marks</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#FF5722" />
        ) : (
          <View>
            {/* 1st Semester */}
            <View style={styles.semesterContainer}>
              <Text style={styles.semesterTitle}>1st Semester</Text>
              <FlatList
                data={getSemesterMarks('1')}
                keyExtractor={(item) => item.$id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
              />
            </View>

            {/* 2nd Semester */}
            <View style={styles.semesterContainer}>
              <Text style={styles.semesterTitle}>2nd Semester</Text>
              <FlatList
                data={getSemesterMarks('2')}
                keyExtractor={(item) => item.$id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  performanceHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },

  yearButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginBottom: 10, // Space between buttons
    // Align to the left side of the container
    marginLeft: -25, // Add left margin for consistent spacing
    width: 'auto', // Adjust width based on content
  },
  

  activeButton: {
    backgroundColor: '#FF5722',
  },

  buttonText: {
    fontSize: 16,
    color: '#fff',
  },

  activeButtonText: {
    color: '#fff',
  },

  feedbackContainer: {
    backgroundColor: '#FFEBEE',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  feedbackText: {
    fontSize: 16,
    color: '#555',
  },

  examiner: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },

  status: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },

  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  marksContainer: {
    marginBottom: 20,
  },

  semesterContainer: {
    marginBottom: 20,
  },

  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  marksHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  text: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },

  list: {
    paddingBottom: 50,
  },
});

export default Profile;
