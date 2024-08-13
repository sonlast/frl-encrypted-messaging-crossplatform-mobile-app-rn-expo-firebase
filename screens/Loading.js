// Loading.js
import React, { useEffect } from "react";
import { Image, View, Text, ActivityIndicator } from "react-native";
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
            width: 150,
            height: 150,
            backgroundColor: '#fff',
            borderRadius: 30,
            alignSelf: 'center',
          }}
          source={require('../assets/soc.png')}
        />
        <Text style={{
          fontFamily: 'TitilliumWeb_600SemiBold',
          fontSize: 40,
          alignSelf: 'center',
          color: '#fff',
          marginTop: 10,
          marginBottom: 30,
        }}>Safe on Chat</Text>
        <ActivityIndicator size="large" color={"#FFFFFF"} />
      </LinearGradient>
    </View>
  );
};

export default Loading;