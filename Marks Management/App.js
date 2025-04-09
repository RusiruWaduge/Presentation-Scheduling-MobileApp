import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import PresentationMarks from '../Marks Management/PresentationMarks';
import StudentMarksList from '../Marks Management/Student_Marks_List';
import StudentCards from '../Marks Management/StudentCards';
import Dashboard from '../Marks Management/Dashboard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create a Tab Navigator that will be shown in the Dashboard screen
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            return <MaterialIcons name="dashboard" size={size} color={color} />;
          } else if (route.name === 'Students') {
            return <FontAwesome name="users" size={size} color={color} />;
          } else if (route.name === 'Marks') {
            return <FontAwesome name="list-alt" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Students" 
        component={StudentCards} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Marks" 
        component={StudentMarksList} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* MainTabs contains the bottom tab navigation */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        {/* These screens will be shown as modal/stack screens */}
        <Stack.Screen 
          name="PresentationMarks" 
          component={PresentationMarks} 
          options={{ title: 'Add Presentation Marks' }}
        />
        <Stack.Screen 
          name="StudentMarksList" 
          component={StudentMarksList} 
          options={{ title: 'Student Marks' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;