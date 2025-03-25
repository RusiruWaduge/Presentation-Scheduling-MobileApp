import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleSendResetLink = () => {
    Alert.alert('Success', `Password reset link sent to ${email}`);
    navigation.navigate('ResetPassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password</Text>
      <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} />
      <Button title="Send Reset Link" onPress={handleSendResetLink} />
    </View>
  );
};

export default ForgotPasswordScreen;