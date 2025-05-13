import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

import Dashboard from '../Marks Management/Dashboard';
import StudentCards from '../Marks Management/StudentCards';
import StudentMarksList from '../Marks Management/Student_Marks_List';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
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
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
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

export default MainTabs;
