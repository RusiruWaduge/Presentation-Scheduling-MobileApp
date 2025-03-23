import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getFeedback } from './appwrite'; // Assuming this function fetches feedback
import UserMenu from './userMenu'; // Import UserMenu Component

const Profile = () => {
  const [selectedYear, setSelectedYear] = useState("overall");
  const [feedbackData, setFeedbackData] = useState({});

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await getFeedback("00001");
        setFeedbackData((prevState) => ({
          ...prevState,
          year1: data,
        }));
      } catch (error) {
        console.error('Error loading feedback:', error);
      }
    };

    fetchFeedback();
  }, []);

  const currentData = feedbackData[selectedYear] || {};

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#f4f4f4" }}>
      {/* Profile Container */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: 'https://www.example.com/path/to/john_doe_profile_pic.jpg' }} style={styles.profilePicture} />
        <Text style={styles.studentName}>John Doe</Text>
        <Text style={styles.profileDetails}>📧 Email: john.doe@example.com</Text>
      </View>

      {/* Header for Student Performance Management */}
      <Text style={styles.performanceHeader}>Student Performance Management</Text>

      {/* Year Buttons */}
      <View style={styles.buttonContainer}>
        {["year1", "year2", "year3", "year4", "overall"].map((year, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedYear(year)}
            style={[styles.yearButton, { backgroundColor: selectedYear === year ? "#FF5722" : "#e0e0e0" }]}
          >
            <Text style={{ color: selectedYear === year ? "#fff" : "#000", fontSize: 16 }}>
              {year === "overall" ? "Overall" : `Year ${index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Section */}
      {currentData ? (
        <>
          <Text style={styles.sectionTitle}>Feedback:</Text>
          <Text style={styles.feedback}>
            {currentData.feedback || "No feedback available for this year."}
          </Text>

          <Text style={styles.examiner}>Examiner: {currentData.examiner || "N/A"}</Text>
          <Text style={styles.status}>Status: {currentData.status || "N/A"}</Text>
          <Text style={styles.date}>Created: {new Date(currentData.$createdAt).toLocaleString()}</Text>
          <Text style={styles.date}>Updated: {new Date(currentData.$updatedAt).toLocaleString()}</Text>
        </>
      ) : (
        <Text>No feedback available for this year.</Text>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    backgroundColor: "orange",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  profileDetails: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 4,
  },
  performanceHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 25,
  },
  yearButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  feedback: {
    fontSize: 16,
    color: "#555",
    marginVertical: 10,
  },
  examiner: {
    fontSize: 16,
    color: "#555",
    fontStyle: "italic",
  },
  status: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  date: {
    fontSize: 14,
    color: "#777",
  },
});

export default Profile;
