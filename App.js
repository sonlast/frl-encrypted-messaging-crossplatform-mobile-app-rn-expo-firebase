import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoadingScreen from './screens/Loading';
import Landingpage from './screens/Landingpage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SettingsScreen from './screens/SettingsScreen';
import SemiApp from './screens/SemiApp';
import PinandFingerPrint from './screens/PinandFingerprint';
import SignUpAuth from './screens/PinandFingerprintSignUp';
import SearchChat from './screens/SearchChat';
import ChatScreen from './screens/ChatScreen';
import VideoCall from './screens/VideoCallScreen';
import AudioCall from './screens/AudioCallScreen';
import CreateGroupChat from './screens/CreateGroupChatScreen';
import GroupChatScreen from './screens/GroupChatScreen';
import GroupChats from './screens/GroupChats';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const Stack = createNativeStackNavigator();
const uuid = uuidv4();

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Load"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4c669f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'TitilliumWeb_400Regular',
        }
      }}
      >
        <Stack.Screen name="Load" component={LoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Land" component={Landingpage} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SemiApp" component={SemiApp} options={{ headerShown: false }} />
        <Stack.Screen name="PinandFingerprint" component={PinandFingerPrint} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpAuth" component={SignUpAuth} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="CreateGroupChat" component={CreateGroupChat} options={{ title: 'Create Group' }}/>
        <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} options={{ headerShown: true }}/>
        <Stack.Screen name="GroupChats" component={GroupChats} options={{ title: 'Group Chats' }}/>
        <Stack.Screen name="SearchChat" component={SearchChat} options={{ title: 'Search Contacts' }}/>
        <Stack.Screen name="VideoCall" component={VideoCall} options={{ title: 'Video Call' }}/>
        <Stack.Screen name="AudioCall" component={AudioCall} options={{ title: 'Audio Call' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

//? SAFE-on-Chat: A Messaging Application with Security Features using RSA and TwoFish Encryption Algorithm

//! ------------------------------ ADDITIONAL FEATURES
//* Sending Attachments (other file types)
//* No SQL
//* Login / Registration Form
//* Chatroom
//* Can't Screenshot
      //* PIN
      //* Fingerprint
      //* Video Call
      //? Audio Call
//* Other Security Features
      //* RSA Encryption
      //TODO: Twofish Encryption 
//* Modify Algorithm

//! --------------------------------- THESIS FEATURES
//* Real-time chat
//* File send
      //* Images
      //* Document (different file types)
//* Group chats
//? Voice Message
//? Video Message
//* Audio Call
//? Picture
//* Data Encryption
//TODO: Multimedia
      //TODO: Audio

//! TASKS for Tomorrow
//? - voice message
//? - video message
//? - configure pin for global storage

//! --------------- UNUSED SCREENS / COMPONENTS --------------- //
// - SettingsScreen.js (Screen)
// - Header.js (Component)

//* ------------------------------ FINAL FEATURES ------------------------------ //
//* Login (Authentication)
//* Registration (Authentication)
//* PIN (Security)
//* Fingerprint (Security)
//* RSA/AES Encryption & Decryption (Security)
//* Disable Screenshot & Screen Recording (Security)
//* Chats List
//* Calls List
//* Group Chats List
//* 1-on-1 Chat 
//* Group Chats
//* File Send (Images, Documents)
//* Typing Indicator
//* Video Call 
//* Audio Call
//* Expo Services
    //* Development Build (Customized Expo Go)
    //* Production Build (APK)
//* Firebase Services 
    //* Authentication (Login, Registration) 
    //* Firestore (Database)
    //* Storage (Files)