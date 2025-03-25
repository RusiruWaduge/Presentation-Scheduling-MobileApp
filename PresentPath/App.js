import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/Home';
import SignupScreen from './components/SignUp&Login/SignupScreen';
import LoginScreen from './components/SignUp&Login/LoginScreen';
import ForgotPasswordScreen from './components/SignUp&Login/ForgotPassword';
import ResetPasswordScreen from './components/SignUp&Login/ResetPassword';
import UserProfile from './components/UserProfile';
import UpdateProfile from './components/UpdateProfile';
import RescheduleForm from './components/RescheduleRequest';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        <Stack.Screen name="RequestReschedule" component={RescheduleForm} />
        <Stack.Screen name="Home" component={HomeScreen} />
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;