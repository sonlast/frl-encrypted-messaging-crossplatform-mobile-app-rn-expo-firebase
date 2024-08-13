import React, { useState, useEffect } from 'react';
import { BackHandler, Image, KeyboardAvoidingView, Pressable, Text, TextInput, View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from '../firebaseConfig';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const auth = getAuth(app);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Land");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const pressLogin = () => {
    setLoading(true);


    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        AsyncStorage.setItem("lastemail", email);
        setAuthError("Log in successful.");
        setTimeout(() => {
          navigation.navigate("SemiApp");
        }, 1000);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        switch (errorCode) {
          case "auth/invalid-login-credentials":
            setAuthError("Account doesn't exist.");
            break;
          case "auth/invalid-credential":
            setAuthError("Invalid Credentials");
            break;
          case "auth/user-not-found":
            setAuthError("Account doesn't exist.");
            break;
          case "auth/invalid-email":
            setAuthError("Please provide a valid email.");
            break;
          case "auth/weak-password":
            setAuthError("Password is too weak. Please provide a stronger password.");
            break;
          case "auth/wrong-password":
            setAuthError("Incorrect password.");
            break;
          case "auth/missing-password":
            setAuthError("Please provide a password.");
            break;
          case "auth/too-many-requests":
            setAuthError("Too many attempts. Please try again later.");
            break;
          default:
            setAuthError("An unexpected error occurred. Please try again later.");
            break;
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };


  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['#4c669f', '#f0ceff']}
        style={
          styles.linearg
        }
        start={[0.5, 0.5]}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior='padding'
        >
          <Image
            style={styles.logo}
            source={require('../assets/soc.png')}
          />
          <Text style={{
            marginTop: 10,
            fontFamily: 'TitilliumWeb_600SemiBold',
            fontSize: 30,
            alignSelf: 'center',
            color: '#fff',
          }}>Safe on Chat</Text>
          <TextInput
            placeholderTextColor={'rgb(200, 200, 200)'}
            placeholder='Email'
            autoCapitalize='none'
            style={styles.input}
            autoFocus={true}
            inputMode='email'
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
          />
          <TextInput
            placeholderTextColor={'rgb(220, 220, 220)'}
            placeholder='Password'
            autoCapitalize='none'
            style={styles.input}
            secureTextEntry={true}
            contextMenuHidden={true}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
            }}
          />
          {authError ? (
            <Text style={{
              color: authError.includes('Log in successful') ? '#00FF00' : 'red',
              marginTop: 20,
              fontFamily: 'TitilliumWeb_400Regular',
              textAlign: 'center',
            }}
            >
              {authError}
            </Text>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? 'rgb(210, 230, 255)'
                  : 'rgb(255, 255, 255)',
              },
              styles.loginbutton
            ]}
            onPress={pressLogin}
          >
            <Text style={styles.logintext}>LOG IN</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
  },
  linearg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  input: {
    marginTop: 50,
    textAlign: 'center',
    width: 225,
    height: 50,
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #000000',
    borderRadius: 10,
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 15,
  },
  logo: {
    marginTop: 120,
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignSelf: 'center'
  },
  loginbutton: {
    marginTop: 30,
    width: 175,
    height: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  logintext: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 17.5,
  },
});

export default LoginScreen;