import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { account, databases } from '../../Libraries/appwriteConfig';
import { Query } from 'appwrite';

const DATABASE_ID = '67dd8a42000b2f5184aa';
const COLLECTION_ID = '67f22df100281c3981da';

const UserProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged in user's details
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const session = await account.get();
        if (!session.email) {
          navigation.replace('UserLogin');
        } else {
          fetchStudentDetails(session.email);
        }
      } catch (error) {
        console.error('Session error:', error);
        navigation.replace('UserLogin');
      }
    };

    const fetchStudentDetails = async (email) => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('email', email)]
        );

        if (response.documents.length > 0) {
          setUserData(response.documents[0]);
        } else {
          Alert.alert('Not Found', 'No profile data found.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        Alert.alert('Error', 'Unable to fetch profile details.');
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      Alert.alert('Logged Out', 'You have been successfully logged out.');
      navigation.replace('UserLogin');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <Image
        source={{
          uri:
            userData?.profilePic ||
            'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png',
        }}
        style={styles.profilePic}
      />

      {/* User Info */}
      <Text style={styles.userName}>
        {userData?.firstName} {userData?.lastName}
      </Text>
      <Text style={styles.userInfo}>📧 {userData?.email}</Text>
      <Text style={styles.userInfo}>📞 {userData?.contactNumber}</Text>
      <Text style={styles.userInfo}>🎓 {userData?.groupID}</Text>
      <Text style={styles.userInfo}>🆔 {userData?.indexNumber}</Text>
      <Text style={styles.userInfo}>📚 Semester: {userData?.semester}</Text>
      <Text style={styles.userRole}>{userData?.role}</Text>

     

      {/* Logout */}
      <TouchableOpacity style={[styles.button, styles.logout]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#003366',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: '#555',
    marginVertical: 2,
  },
  userRole: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 3,
  },
  logout: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});

export default UserProfile;
