import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getFeedback } from './appwrite'; // Import function

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Fetch feedback data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFeedback(); // Call the getFeedback function
        
        if (Array.isArray(data)) {
          setFeedbacks(data); // If data is an array, update the state
        } else {
          setError('Invalid data format');
        }
      } catch (error) {
        setError('Failed to load feedback');
        console.error('Failed to load feedback:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Performance Feedback</Text>
      
      {/* Loop through feedbacks */}
      {feedbacks.length === 0 ? (
        <Text style={styles.noFeedbackText}>No feedback available</Text>
      ) : (
        feedbacks.map((feedback, index) => (
          <View key={index} style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              ✅ {feedback.year}: {feedback.feedback}
            </Text>
            <Text style={styles.examinerText}>
              👨‍🏫 Examiner: {feedback.examiner}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  feedbackContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 16,
    color: '#555',
  },
  examinerText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  noFeedbackText: {
    fontSize: 16,
    color: '#777',
  },
});

export default Feedback;
