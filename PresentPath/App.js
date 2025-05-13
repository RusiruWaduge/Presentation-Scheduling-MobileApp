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
import OnboardingScreen from './Screens/OnBoardingScreen';
//User Management Roots
import Presentation_Marks from './Screens/UserProfileManagement/Marks';
import MyPresentation from './Screens/UserProfileManagement/MyPresentation';
import UpdateProfile from './Screens/UserProfileManagement/UpdateProfile';
import StudentProfile from './Screens/UserProfileManagement/studentprofile';
import ExaminerContact from "./Screens/UserProfileManagement/ExaminerContact";
import UpcomingPresentation from "./Screens/UserProfileManagement/UpcomingPresentation";
import AddStickyNote from "./Screens/UserProfileManagement/AddStickyNotes";
import StickyNotes from "./Screens/UserProfileManagement/StickyNotes";


const Stack = createStackNavigator();


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OnboardingScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
        <Stack.Screen name="UserSignup" component={UserSignupScreen} />
        <Stack.Screen name="UserHome" component={UserMenu} />
        <Stack.Screen name="MainDashboard" component={MainDashboardScreen} />
        <Stack.Screen name="MarksDashboard" component={MarksDashboard} />
        <Stack.Screen name="PresentationDashboard" component={PresentationDashboard} />
         {/* These screens will be shown as modal/stack screens */}
         
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

        {/* Add more screens as needed */}
        
         <Stack.Screen name="Presentation_Marks" component={Presentation_Marks} />
         <Stack.Screen name="MyPresentation" component={MyPresentation} />
         <Stack.Screen name="UpdateProfile" component={UpdateProfile} /> 
          <Stack.Screen name="StudentProfile" component={StudentProfile} />
          <Stack.Screen name="ExaminerContact" component={ExaminerContact} />
          <Stack.Screen name="UpcomingPresentation" component={UpcomingPresentation} />
          <Stack.Screen name="AddStickyNote" component={AddStickyNote} />
          <Stack.Screen name="StickyNotes" component={StickyNotes} />
          
         
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
