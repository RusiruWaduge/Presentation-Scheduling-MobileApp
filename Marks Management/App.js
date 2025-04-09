import React from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PresentationMarks from '../Marks Management/PresentationMarks'; // Page for submitting marks
import StudentMarksList from '../Marks Management/Student_Marks_List'; // Page for viewing submitted marks
import StudentCards from '../Marks Management/StudentCards';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StudentCards">
        <Stack.Screen name="PresentationMarks" component={PresentationMarks} />
        <Stack.Screen name="StudentMarksList" component={StudentMarksList} />
        <Stack.Screen name="StudentCards" component={StudentCards} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
