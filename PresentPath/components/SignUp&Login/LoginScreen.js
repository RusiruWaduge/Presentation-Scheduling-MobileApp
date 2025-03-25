import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Client, Databases, Query } from 'appwrite';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67dd8453002a601838ad');

const databases = new Databases(client);

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await databases.listDocuments('67dd8a42000b2f5184aa', 'Students', [Query.equal('email', email)]);
      if (response.documents.length === 0) {
        Alert.alert('Error', 'User not found');
        return;
      }
      const student = response.documents[0];
      if (student.password === password) {
        await AsyncStorage.setItem('user', JSON.stringify(student));
        Alert.alert('Success', 'Login Successful');
        navigation.navigate('UserProfile');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'There was an error logging in');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingLeft: 10 },
  forgotPassword: { color: 'blue', textAlign: 'center', marginTop: 10 },
});

export default LoginScreen;