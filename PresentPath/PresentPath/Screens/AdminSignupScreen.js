import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { account, databases } from '../Libraries/appwriteConfig';

const AdminSignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async () => {
    try {
      const user = await account.create('unique()', email, password, name);
      await databases.createDocument('Examiner', 'unique()', { // Replace with admin collection ID
        userId: user.$id,
        email: email,
        name: name,
      });
      console.log('Admin Signup successful:', user);
      // Navigate to admin login or next screen
      navigation.navigate('AdminLogin'); // Ensure you have this screen defined.
    } catch (error) {
      console.error('Admin Signup error:', error);
      Alert.alert('Admin Signup Failed', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Admin Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Admin Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Admin Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Admin Signup" onPress={handleSignup} />
    </View>
  );
};

export default AdminSignupScreen;