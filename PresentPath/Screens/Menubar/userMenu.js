import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';

// Screens
import ProfilePage from '../StudentperformanceAnalysis/userProfile';
import StdProfile from '../StudentperformanceAnalysis/profile';
import Home from '../StudentperformanceAnalysis/home';


const Stack = createNativeStackNavigator(); // ✅ FIXED

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="StdProfile" component={StdProfile} />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const UserMenu = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'user';
          else if (route.name === 'Feedback') iconName = 'comments';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingVertical: 10,
          height: 65,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfilePage} />
     
    </Tab.Navigator>
  );
};

export default UserMenu;
