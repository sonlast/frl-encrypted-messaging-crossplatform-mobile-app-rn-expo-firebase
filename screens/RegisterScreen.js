import React, { useState, useEffect } from 'react';
import { Alert, BackHandler, TouchableOpacity, KeyboardAvoidingView, Image, Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageProvider, useImage } from './ImageContext';
import { app } from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
// import QuickCrypto from 'react-native-quick-crypto';
import RSA from 'react-native-rsa-native';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [matched, setMatched] = useState("");
  const [loading, setLoading] = useState(false);
  const imageProps = useImage() || {};
  const image = imageProps.image || null;
  const setImage = imageProps.setImage || (() => { });
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!password.match(/[A-Z]/)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!password.match(/[a-z]/)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!password.match(/[0-9]/)) {
      errors.push("Password must contain at least one number.");
    }
    if (!password.match(/[\W_]/)) {
      errors.push("Password must contain at least one special character.");
    }
    return errors;
  };

  // const generateKeyPair = async () => {
  //   const { publicKey, privateKey } = QuickCrypto.generateKeyPairSync('rsa', {
  //     modulusLength: 2048,
  //     publicKeyEncoding: {
  //       type: 'spki',
  //       format: 'pem',
  //     },
  //     privateKeyEncoding: {
  //       type: 'pkcs8',
  //       format: 'pem',
  //     },
  //   });

  //   await AsyncStorage.setItem('privateKey', privateKey);
  //   return publicKey;
  // };

  const generateKeyPair = async () => {
    const keys = await RSA.generateKeys(2048);
    const { public: publicKey, private: privateKey } = keys;

    // await AsyncStorage.setItem('privateKey', privateKey);
    await SecureStore.setItemAsync('privateKey', privateKey);
    return publicKey;
  }

  const pressSignup = async () => {
    const formattedUsername = username.trim().charAt(0).toUpperCase() + username.slice(1);
    if (!image) {
      setError('Profile picture is required');
      return;
    }
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Fill in the required fields.');
      setMatched('');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setMatched('');
      return;
    } else {
      setError('');
      setMatched('Passwords matched');
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let imageUrl = '';
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const publicKey = await generateKeyPair();

      const userDoc = doc(firestore, "users", user.uid);
      await setDoc(userDoc, {
        uid: user.uid,
        username: formattedUsername,
        email: email,
        profilePicture: imageUrl,
        publicKey: publicKey,
      });

      setAuthError("Account created successfully!");
      setTimeout(() => {
        navigation.navigate("SignUpAuth");
      }, 1000);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;

      switch (errorCode) {
        case "auth/invalid-email":
          setAuthError("Fill in the required fields.");
          break;
        case "auth/missing-password":
          setAuthError("Fill in your password.");
          break;
        case "auth/missing-email":
          setAuthError("Fill in your email address.");
          break;
        case "auth/weak-password":
          setAuthError("Password is too weak. It must be at least 6 characters long.");
          break;
        case "auth/email-already-in-use":
          setAuthError("The email address is already in use by another account.");
          break;
        default:
          Alert.alert(
            "SAFE-ON-CHAT",
            `Account creation error occurred. Please try again later. Error: ${errorMessage}`
          );
          break;
      }
    } finally {
      setLoading(false);
    }
  };

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

  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    }).catch((error) => console.log(error));

    if (!result.canceled && result.assets) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#f0ceff']}
        style={styles.linearg}
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
            fontFamily: 'TitilliumWeb_600SemiBold',
            fontSize: 30,
            alignSelf: 'center',
            color: '#fff',
            marginTop: 10,
            marginBottom: 30,
          }}>Safe on Chat</Text>
          <TouchableOpacity onPress={pickImage}>
            {!image && (
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <MaterialCommunityIcons
                  name="upload"
                  size={24}
                  color="#ffffff"
                />
                <Text
                  style={{
                    marginTop: 10,
                    marginBottom: 20,
                    color: "#ffffff",
                    fontFamily: "TitilliumWeb_600SemiBold",
                  }}
                >
                  Upload Profile Picture
                </Text>
              </View>
            )}
            {image && (
              <Image
                source={{ uri: image }}
                style={{
                  marginBottom: 40,
                  width: 75,
                  height: 75,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderColor: "#ffffff",
                }}
              />
            )}
          </TouchableOpacity>
          <View style={styles.inputs}>
            <TextInput
              placeholderTextColor={'rgb(200, 200, 200)'}
              placeholder='Username'
              style={[styles.input, { marginTop: 0 }]}
              autoCapitalize='none'
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TextInput
              placeholderTextColor={'rgb(220, 220, 220)'}
              placeholder='Email'
              style={styles.input}
              autoCapitalize='none'
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              placeholderTextColor={'rgb(220, 220, 220)'}
              placeholder='Password'
              style={styles.input}
              autoCapitalize='none'
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <TextInput
              placeholderTextColor={'rgb(220, 220, 220)'}
              placeholder='Confirm Password'
              style={styles.input}
              autoCapitalize='none'
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.matchedpass}>{matched}</Text>}
            {authError ? (
              <Text style={{
                color: authError.includes('Account created successfully!') ? '#00FF00' : 'red',
                marginTop: 20,
                fontFamily: 'TitilliumWeb_400Regular',
                textAlign: 'center',
              }}
              >
                {authError}
              </Text>
            ) : null}
          </View>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? 'rgb(210, 230, 255)'
                  : 'rgb(255, 255, 255)',
              },
              styles.signupbutton
            ]}
            onPress={pressSignup}
            disabled={loading}
          >
            <Text style={styles.signuptext}>SIGN UP</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  linearg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  inputs: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginTop: 25,
    textAlign: 'center',
    width: 225,
    height: 50,
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 15,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignSelf: 'center',
  },
  signupbutton: {
    marginTop: 30,
    width: 175,
    height: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  signuptext: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 17.5,
  },
  errorText: {
    color: '#ff0000',
    marginTop: 10,
    fontFamily: 'TitilliumWeb_600SemiBold',
  },
  matchedpass: {
    color: '#00ff00',
    marginTop: 10,
    fontFamily: 'TitilliumWeb_600SemiBold',
  }
});

export default function AppWrapper() {
  return (
    <ImageProvider>
      <RegisterScreen />
    </ImageProvider>
  )
};