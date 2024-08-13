import React, { useState } from 'react';
import { Alert, Text, View, Image, Pressable, StyleSheet, ToastAndroid } from 'react-native';
import { UserProvider, useUser } from './UserContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Chats from './Chats';
import Calls from './Calls';
import SettingsScreen from './SettingsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCommentDots, faPhone, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const auth = getAuth();
  const navigator = useNavigation();
  const { user } = useUser();

  // Function to handle the actual logout
  const handleLogout = async () => {
    Alert.alert(
      "LOG OUT",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => {
            ToastAndroid.show("Logout cancelled", ToastAndroid.SHORT);
          },
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {
            await signOut(auth);
            navigator.navigate("Land");
          }
        }
      ]
    )
  };

  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ flex: 1 }}>
        <View style={styles.drawerHeader}>
          <Image
            style={styles.profilepic}
            // source={require('../assets/profilepic.jpg')}
            source={user && user.profilePicture ? { uri: user.profilePicture } : require('../assets/profilepic.jpg')}
          />
          {user && <Text style={styles.drawerHeaderText}>{user.username}</Text>}
        </View>
        <DrawerItemList {...props} />
      </View>
      <Pressable
        style={{
          marginBottom: 20,
          paddingVertical: 15,
          paddingHorizontal: 10,
          borderRadius: 5,
        }}
        onPress={handleLogout}>
        <Text style={{
          fontFamily: 'TitilliumWeb_600SemiBold',
          fontSize: 16,
          color: '#fff',
          backgroundColor: '#ff0000',
          textAlign: 'center',
          borderRadius: 10,
          padding: 10,
        }}>
          {/* <FontAwesomeIcon icon={faArrowRightFromBracket} size={20} color="#fff"/>
           */}
          Log Out
        </Text>
      </Pressable>
    </DrawerContentScrollView>
  );
};

const ChatsScreen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#f0ceff']}
        style={styles.linearGradient}
        start={[0.5, 0.5]}
      >
        <Chats />
      </LinearGradient>
    </View>
  );
};

const CallsScreen = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#f0ceff']}
        style={styles.linearGradient}
        start={[0.5, 0.5]}
      >
        <Calls />
      </LinearGradient>
    </View>
  );
};

// const Settings = () => {
//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#4c669f', '#f0ceff']}
//         style={styles.linearGradient}
//         start={[0.5, 0.5]}
//       >
//         <SettingsScreen />
//       </LinearGradient>
//     </View>
//   );
// };

const TabNavigator = () => {
  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 20,
          backgroundColor: '#eff',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'TitilliumWeb_600SemiBold',
          fontSize: 15,
          color: ({ focused }) => (
            focused ? '#00ff' : '#000'
          )
        },
      }}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <FontAwesomeIcon
            icon={faCommentDots}
            color={focused ? "#000" : "#4c669f"}
            size={25}
            style={{
              marginBottom: 15,
            }}
          />
        ),
      }}
      />
      <Tab.Screen name="Calls" component={CallsScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <FontAwesomeIcon
            icon={faPhone}
            color={focused ? "#000" : "#4c669f"}
            size={25}
            style={{
              marginBottom: 15,
            }}
          />
        ),
      }} />
    </Tab.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f0ceff',
          width: 250,
        },
        drawerType: 'front',
        drawerLabelStyle: {
          fontFamily: 'TitilliumWeb_600SemiBold',
        },
        gestureEnabled: false,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TabNavigator}
        options={{
          headerShown: false,
          drawerLabel: 'Chats',
        }}
      />
      {/* <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
          drawerLabel: 'Settings',
        }}
      /> */}
    </Drawer.Navigator>
  );
};

{/* <Drawer.Screen */ }
//   name="Settings"
//   component={Settings}
//   options={{
//     headerShown: false,
//     drawerLabel: 'Settings',
//   }}
// />

const App = () => {
  return (
    <UserProvider>
      <DrawerNavigator />
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: "#4c669f",
  },
  profilepic: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginRight: 10,
  },
  drawerHeaderText: {
    fontFamily: 'TitilliumWeb_400Regular',
    fontSize: 20,
    color: '#fff',
  },
});

export default App;
