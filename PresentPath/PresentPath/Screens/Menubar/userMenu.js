import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';

// Screens
import ProfilePage from '../StudentPerformanceAnalysis/userProfile';
import UserDashboard from '../UserDashboard';
import Home from '../StudentPerformanceAnalysis/home';
import Presentation_Marks from '../UserProfileManagement/Marks';
import MyPresentation from '../UserProfileManagement/MyPresentation';
import UpdateProfile from '../UserProfileManagement/UpdateProfile';



const Stack = createNativeStackNavigator(); // ✅ FIXED

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="UserDashboard" component={UserDashboard} />
      <Stack.Screen name="Presentation_Marks" component={Presentation_Marks} />
         <Stack.Screen name="MyPresentation" component={MyPresentation} />
         <Stack.Screen name="UpdateProfile" component={UpdateProfile} /> 
         
      {/* Add more screens here if needed */}
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
      <Tab.Screen name="Profile" component={UserDashboard} />
     
    </Tab.Navigator>
  );
};

export default UserMenu;
