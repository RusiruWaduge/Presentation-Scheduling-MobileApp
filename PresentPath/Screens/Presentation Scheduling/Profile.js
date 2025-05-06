import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { databases, account } from '../../Libraries/appwriteConfig'; // Import Appwrite databases
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient for gradient background

const Profile = ({ navigation }) => {
  const [scheduledCount, setScheduledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [userData, setUserData] = useState(null); // State to hold user data

  const databaseId = '67dd8a42000b2f5184aa'; // Your database ID
  const scheduledCollectionId = 'PresentationSchedules'; // Scheduled presentations collection ID
  const completedCollectionId = 'completed_presentations'; // Completed presentations collection ID

  // Hardcoded Department and Location
  const department = 'Information Technology';
  const location = 'Main Building, 7th Floor';

  // Fetch the initial count of presentations
  const fetchStats = async () => {
    try {
      // Get count of scheduled presentations
      const scheduledResponse = await databases.listDocuments(databaseId, scheduledCollectionId);
      setScheduledCount(scheduledResponse.total);

      // Get count of completed presentations
      const completedResponse = await databases.listDocuments(databaseId, completedCollectionId);
      setCompletedCount(completedResponse.total);
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "Failed to fetch presentation stats.");
    }
  };

  // Fetch the logged-in user's profile data
  const fetchUserData = async () => {
    try {
      const user = await account.get(); // Fetch the authenticated user's data
      setUserData(user); // Store user data in state
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data.");
    }
  };

  // Polling to get updated stats every 10 seconds
  useEffect(() => {
    fetchStats(); // Initial fetch of stats
    fetchUserData(); // Fetch user data when the component mounts

    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchStats, 10000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current"); // Logs out the user
      Alert.alert("Logout Successful", "You have been logged out.");
      navigation.replace("UserLogin"); // Navigate to login screen
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1e3c72', '#2a5298']} // Dark Blue gradient
        style={styles.header}
      >
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={require('../../assets/DP2.jpg')} // Profile image from the assets folder
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData ? userData.name : 'John Doe'}</Text>
          <Text style={styles.role}>Examiner</Text> {/* Hardcoded Role */}
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.profileText}>Email: {userData ? userData.email : 'johndoe@example.com'}</Text>
          <Text style={styles.profileText}>Phone: {userData ? userData.phone : '+1234567890'}</Text>
          <Text style={styles.profileText}>Department: {department}</Text>  {/* Hardcoded Department */}
          <Text style={styles.profileText}>Location: {location}</Text>  {/* Hardcoded Location */}
        </View>
      </View>

      {/* Statistics / Count Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.statsHeader}>Presentation Stats</Text>

        {/* Cards for Scheduled and Completed Presentations */}
        <View style={styles.cardsContainer}>
          <View style={[styles.statsCard, styles.scheduledCard]}>
            <Text style={styles.statsText}>Scheduled Presentations: {scheduledCount}</Text>
          </View>

          <View style={[styles.statsCard, styles.completedCard]}>
            <Text style={styles.statsText}>Completed Presentations: {completedCount}</Text>
          </View>
        </View>
      </View>

      {/* Contact Info Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactHeader}>Contact Information</Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactText}>Email: {userData ? userData.email : 'johndoe@example.com'}</Text>
          <Text style={styles.contactText}>Phone: {userData ? userData.phone : '+1234567890'}</Text>
          <Text style={styles.contactText}>Office: Room 101, XYZ Building</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    height: 150, // Reduced the height of the header
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#ff0000',  // Red Logout Button
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: -70,  // Adjusted to make it closer to the header
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    resizeMode: 'cover',
      // Ensures the profile picture is zoomed in slightly
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 18,
    color: '#007bff',
    marginBottom: 15,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,  // Reduced padding to bring details closer
  },
  profileText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,  // Reduced margin for compact layout
  },
  statsSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  statsHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 10,
  },
  scheduledCard: {
    backgroundColor: '#007bff', // Blue for scheduled presentations
  },
  completedCard: {
    backgroundColor: '#28a745', // Green for completed presentations
  },
  statsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  contactSection: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  contactHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
});

export default Profile;
