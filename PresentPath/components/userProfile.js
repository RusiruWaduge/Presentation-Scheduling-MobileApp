import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const UserProfile = () => {
  const navigation = useNavigation();

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePic: 'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png',
    role: 'Student',
    phoneNumber: '+123 456 7890',
    department: 'Computer Science',
    registrationNumber: 'REG-12345'
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <Image source={{ uri: user.profilePic }} style={styles.profilePic} />

      {/* User Information */}
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userInfo}>📧 {user.email}</Text>
      <Text style={styles.userInfo}>📞 {user.phoneNumber}</Text>
      <Text style={styles.userInfo}>🎓 {user.department}</Text>
      <Text style={styles.userInfo}>🆔 {user.registrationNumber}</Text>
      <Text style={styles.userRole}>{user.role}</Text>

      {/* Navigate to Profile Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('StdProfile')}
      >
        <Text style={styles.buttonText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default UserProfile;
