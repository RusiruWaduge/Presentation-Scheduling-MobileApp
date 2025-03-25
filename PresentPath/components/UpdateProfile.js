import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Databases } from 'appwrite';  // Import Appwrite client
import { useNavigation } from '@react-navigation/native';  // Import useNavigation for navigation

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')  // Appwrite endpoint
  .setProject('67dd8453002a601838ad');  // Project ID

const databases = new Databases(client);

const UpdateProfile = () => {
  const navigation = useNavigation();  // Hook for navigation

  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [semester, setSemester] = useState('');
  const [groupId, setGroupId] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        setUser(userDataParsed);
        setFirstName(userDataParsed.first_name);
        setLastName(userDataParsed.last_name);
        setSemester(userDataParsed.semester);
        setGroupId(userDataParsed.group_id);
        setIndexNumber(userDataParsed.index_number);
        setEmail(userDataParsed.email);
        setContactNumber(userDataParsed.contact_number);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !email || !contactNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Assuming the user ID is stored in AsyncStorage, otherwise, modify as needed
      const userId = user?.$id; // You need to have a way to retrieve the current user's ID

      const updatedUser = {
        first_name: firstName,
        last_name: lastName,
        semester,
        group_id: groupId,
        index_number: indexNumber,
        email,
        contact_number: contactNumber,
      };

      const response = await databases.updateDocument(
        '67dd8a42000b2f5184aa', // Database ID
        'Students', // Collection ID
        userId, // Document ID (user ID from Appwrite)
        updatedUser
      );

      console.log('Document updated', response);
      Alert.alert('Success', 'Profile Updated Successfully');

      // Update AsyncStorage to reflect changes
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      // Navigate to UserProfile screen after successful update
      navigation.navigate('UserProfile');  // Ensure 'UserProfile' screen is registered in your navigator
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an error while updating the profile');
    }
  };

  if (!user) {
    return <Text>Loading user data...</Text>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Update Your Profile</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Semester"
              value={semester}
              onChangeText={setSemester}
            />
            <TextInput
              style={styles.input}
              placeholder="Group ID"
              value={groupId}
              onChangeText={setGroupId}
            />
            <TextInput
              style={styles.input}
              placeholder="Index Number"
              value={indexNumber}
              onChangeText={setIndexNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
          </View>

          {/* Update Profile Button */}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
            <Text style={styles.updateText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%', // Ensures scrolling is enabled
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    alignItems: 'center', // Center elements
    width: '100%',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5, // Shadow effect
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    width: '100%',
  },
  updateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateProfile;
