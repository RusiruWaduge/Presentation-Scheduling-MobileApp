import React from 'react';
import { View, Button } from 'react-native';

const SelectionScreen = ({ navigation }) => {
  return (
    <View>
      <Button title="Admin Login/Signup" onPress={() => navigation.navigate('Admin')} />
      <Button title="User Login/Signup" onPress={() => navigation.navigate('User')} />
    </View>
  );
};

export default SelectionScreen;
