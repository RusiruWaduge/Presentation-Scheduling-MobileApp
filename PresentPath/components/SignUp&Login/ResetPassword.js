import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const navigation = useNavigation();

  const handleResetPassword = () => {
    Alert.alert('Success', 'Password has been reset successfully');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <TextInput style={styles.input} placeholder="Enter new password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Button title="Reset Password" onPress={handleResetPassword} />
    </View>
  );
};

export default ResetPasswordScreen;