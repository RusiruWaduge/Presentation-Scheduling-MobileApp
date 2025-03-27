import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import Screens
import ProfilePage from './userProfile';
import StdProfile from './profile';
import Feedback from './feedBack';
import Home from './home'

const Stack = createStackNavigator();

const UserMenu = () => {
  const navigation = useNavigation();

  return (
    <>
      {/* Navigation Stack */}
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>

        <Stack.Screen name="StdProfile" component={StdProfile} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Feedback" component={Feedback} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>

      {/* Bottom Menu */}
      <View style={styles.menuContainer}>
        {/* Navigate to Student Profile */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Icon name="home" size={28} color="#003366" />
        </TouchableOpacity>

        {/* Navigate to Profile */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="user" size={28} color="#003366" />
        </TouchableOpacity>

        {/* Navigate to Feedback */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Icon name="comments" size={28} color="#003366" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default UserMenu;
