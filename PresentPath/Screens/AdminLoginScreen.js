import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { account } from '../Libraries/appwriteConfig';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const session = await account.createEmailSession(email, password);
      console.log('✅ Admin Login successful:', session);
      Alert.alert('Success', 'Login successful!');

      // Navigate to Admin Dashboard
      navigation.navigate('AdminDashboard'); // Ensure this screen exists
    } catch (error) {
      console.error('❌ Admin Login error:', error);
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="done"
      />
      <TextInput
        style={styles.input}
        placeholder="Admin Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="done"
      />
      <Button title={loading ? 'Logging in...' : 'Admin Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default AdminLoginScreen;
