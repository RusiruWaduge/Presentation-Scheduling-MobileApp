import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Import UserMenu (handles navigation internally)
import UserMenu from './components/userMenu';
import TopBar from './components/topBar';

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        {/* UserMenu handles all screens and navigation */}
        <UserMenu />
      
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
