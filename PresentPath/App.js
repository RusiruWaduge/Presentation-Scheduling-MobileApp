// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";



import UserLoginScreen from "./Screens/UserLoginScreen";

import UserSignupScreen from "./Screens/UserSignupScreen";

import MainDashboardScreen from "./Screens/MainDashboard";
import UserMenu from "./Screens/Menubar/userMenu";

import PresentationDashboard from "./Screens/Presentation Scheduling/dashboard";
import MarksDashboard from "./Screens/Marks Management/Dashboard";
import PresentationMarks from './Screens/Marks Management/PresentationMarks';
import StudentMarksList from './Screens/Marks Management/Student_Marks_List';
import StudentCards from './Screens/Marks Management/StudentCards';

const Stack = createStackNavigator();


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UserLogin" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
        <Stack.Screen name="UserSignup" component={UserSignupScreen} />
        <Stack.Screen name="UserHome" component={UserMenu} />
        <Stack.Screen name="MainDashboard" component={MainDashboardScreen} />
        <Stack.Screen name="MarksDashboard" component={MarksDashboard} />
        <Stack.Screen name="PresentationDashboard" component={PresentationDashboard} />
         {/* These screens will be shown as modal/stack screens */}
         <Stack.Screen 
          name="PresentationMarks" 
          component={PresentationMarks} 
          options={{ title: 'Add Presentation Marks' }}
        />
        <Stack.Screen 
          name="Marks" 
          component={StudentMarksList} 
          options={{ title: 'Student Marks' }}
        />

                <Stack.Screen 
        name="Students" 
        component={StudentCards} 
        options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
