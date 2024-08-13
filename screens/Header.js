import * as React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation } from '@react-navigation/native';

const Item = ({ title, image }) => (
  <View style={styles.item}>
    <Image source={image} style={styles.image} />
    <Text style={styles.title}>{title}</Text>
  </View>
)

const Header = () => {
  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });

  const navigation = useNavigation();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                console.log('Profile Picture Pressed');
                navigation.openDrawer();
              }}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                }
              ]}
            >
              <Image
                style={styles.profilepic}
                source={require('../assets/profilepic.jpeg')}
              />
            </Pressable>
            <Text style={styles.textheader}>
              Safe-on-chat
            </Text>
          </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 0,
    padding: 10,
  },
  textheader: {
    fontFamily: 'TitilliumWeb_400Regular',
    fontSize: 25,
    color: 'hsl(0, 0%, 100%)',
    // marginTop: 6,
    textAlignVertical: 'center',
    marginLeft: 10,
  },
  profilepic: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 10,
  },
})

export default Header;