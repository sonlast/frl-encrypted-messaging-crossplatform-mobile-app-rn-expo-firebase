// Loading.js
import React, { useEffect } from "react";
import { Image, View, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const Loading = () => {
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("PinandFingerprint");
      } else {
        navigation.replace("Land");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <LinearGradient
        colors={['#4c669f', '#f0ceff']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
        }}
        start={[0.5, 0.5]}
      >
        <Image
          style={{
            marginTop: 150,
            width: 250,
            height: 250,
            alignSelf: 'center',
          }}
          source={require('../assets/soclogo.png')}
        />
        <ActivityIndicator size="large" color={"#FFFFFF"} />
      </LinearGradient>
    </View>
  );
};

export default Loading;