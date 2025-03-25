import React from 'react';
import { View, Text, Image, Button } from 'react-native';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <Swiper loop={false} showsButtons={true}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Image source={require('../assets/icon.png')} style={{ width: 300, height: 300 }} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Welcome to the App</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Schedule and manage your presentations easily.</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Image source={require('../assets/favicon.png')} style={{ width: 300, height: 300 }} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>For Examiners & Students</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>A dedicated platform for both examiners and students.</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Image source={require('../assets/icon.png')} style={{ width: 300, height: 300 }} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Get Started</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Click below to begin using the app.</Text>
        <Button title="Get Started" onPress={() => navigation.navigate('Login')} />
      </View>
    </Swiper>
  );
};

export default OnboardingScreen;