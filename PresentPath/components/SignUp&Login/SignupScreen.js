import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Client, Databases } from 'appwrite';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Icons for password visibility

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67dd8453002a601838ad');

const databases = new Databases(client);

const SignupScreen = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [semester, setSemester] = useState('');
  const [groupId, setGroupId] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (password.length > 15) {
      Alert.alert('Error', 'Password must not exceed 15 characters');
      return;
    }

    try {
      const response = await databases.createDocument(
        '67dd8a42000b2f5184aa', // Database ID
        'Students', // Collection name
        'unique()', // Document ID
        {
          first_name: firstName,
          last_name: lastName,
          semester,
          group_id: groupId,
          index_number: indexNumber,
          email,
          contact_number: contactNumber,
          password, // Store plain password temporarily
        }
      );

      console.log('Document created', response);
      Alert.alert('Success', 'Sign Up Successful');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'There was an error during sign up');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Create Your Account</Text>

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <TextInput style={styles.input} placeholder="Semester" value={semester} onChangeText={setSemester} />
            <TextInput style={styles.input} placeholder="Group ID" value={groupId} onChangeText={setGroupId} />
            <TextInput style={styles.input} placeholder="Index Number" value={indexNumber} onChangeText={setIndexNumber} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Contact Number" keyboardType="phone-pad" value={contactNumber} onChangeText={setContactNumber} />

            {/* Password Input with Visibility Toggle */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Signup Button */}
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Login</Text></Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  signupButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    width: '100%',
  },
  signupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});

export default SignupScreen;
