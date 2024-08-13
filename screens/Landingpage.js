import * as React from 'react';
import { Image, Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation } from '@react-navigation/native';

const Landingpage = () => {
  const navigation = useNavigation();

  const pressSignUp = () => {
    navigation.navigate('Register');
  }

  const pressLogin = () => {
    navigation.navigate('Login');
  }
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
        <Image
          style={styles.logo}
          source={require('../assets/soc.png')}
        />
        <Text style={{
          fontFamily: 'TitilliumWeb_600SemiBold',
          fontSize: 40,
          alignSelf: 'center',
          color: '#fff',
          marginBottom: 30,
        }}>Safe on Chat</Text>
        <Pressable
          onPress={pressLogin}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? 'rgb(210, 230, 255)'
                : 'white',
            },
            styles.loginbutton
          ]}
        >
          <Text style={styles.logintext}>LOG IN</Text>
        </Pressable>
        <View style={styles.groupedtext}>
          <Text style={styles.randomtext}>No Account?</Text>
          <Text style={[{color: '#0000ff'}, styles.randomtext]} onPress={pressSignUp}> Sign Up Here</Text>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  linearg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  logo: {
    marginTop: 175,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  loginbutton: {
    marginTop: 20,
    width: 180,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  logintext: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 17.5,
  },
  randomtext: {
    marginTop: 20,
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 15,
    alignSelf: 'center',
  },
  groupedtext: {
    flexDirection: 'row',
    justifyContent: 'center',
  }
});

export default Landingpage;