import React from "react";
import { View, Button } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminLoginScreen from "./Screens/AdminLoginScreen";
import UserLoginScreen from "./Screens/UserLoginScreen";
import AdminSignupScreen from "./Screens/AdminSignupScreen";
import UserSignupScreen from "./Screens/UserSignupScreen";
import SelectionScreen from "./Screens/SelectionScreen";
import AdminDashboard from "./Screens/AdminDashboard"; // You'll need to create this
import UserDashboard from "./Screens/UserDashboard"; // You'll need to create this
import OnboardingScreen from "./Screens/OnboardingScreen"; // You'll need to create this
import Marks from "./Screens/UserProfileScreens/Marks";
import MyPresentation from "./Screens/UserProfileScreens/MyPresentation"; // You'll need to create this

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name="Selection" component={SelectionScreen} />
        <Stack.Screen name="Admin" component={AdminSelection} />
        <Stack.Screen name="User" component={UserSelection} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminSignup" component={AdminSignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
        <Stack.Screen name="UserSignup" component={UserSignupScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="Marks" component={Marks} />
        <Stack.Screen name="MyPresentation" component={MyPresentation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AdminSelection({ navigation }) {
  return (
    <View>
      <Button title="Login" onPress={() => navigation.navigate("AdminLogin")} />
      <Button
        title="Signup"
        onPress={() => navigation.navigate("AdminSignup")}
      />
    </View>
  );
}
function UserSelection({ navigation }) {
  return (
    <View>
      <Button title="Login" onPress={() => navigation.navigate("UserLogin")} />
      <Button
        title="Signup"
        onPress={() => navigation.navigate("UserSignup")}
      />
    </View>
  );
}

export default App;
