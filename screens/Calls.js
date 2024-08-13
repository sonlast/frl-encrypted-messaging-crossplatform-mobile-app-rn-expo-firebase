import React, { useEffect, useState, useCallback } from 'react'
import { BackHandler, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Avatar } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { SearchBar } from '@rneui/themed';

const Item = ({ user }) => (
  <View style={styles.item}>
    <View style={{
      flexDirection: 'row',
      paddingVertical: 2.5,
      paddingHorizontal: 5,
    }}>
      <View>
        <Avatar size={48} rounded source={user.profilePicture ? { uri: user.profilePicture } : require('../assets/profilepic.jpg')} />
      </View>
      <View>
        <Text style={{
          fontFamily: 'TitilliumWeb_400Regular',
          fontSize: 20,
          paddingLeft: 10,
          paddingVertical: 10,
          textAlignVertical: 'center',
        }}>{user.username}</Text>
      </View>
    </View>
  </View>
);

const Calls = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [userInput, setUserInput] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const fetchCalls = async () => {
    try {
      const callsCollection = collection(firestore, 'calls');
      const callSnapshot = await getDocs(callsCollection);
      const callList = callSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentUserId = auth.currentUser.uid;
      const userCalls = callList.filter(call => call.uid === currentUserId);
      setUsers(userCalls);
      setFilteredUsers(userCalls);
    } catch (error) {
      console.error('Error fetching calls: ', error);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfilePicture(userData.profilePicture || '')
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching profile picture: ', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfilePicture();
      fetchCalls();
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const navigation = useNavigation();

  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });


  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              navigation.openDrawer();
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              }, {
                borderRadius: 50,
                borderWidth: 2.5,
                borderColor: 'hsl(0, 0%, 100%)',
              }
            ]}
          >
            <Avatar
              size={48}
              rounded
              source={profilePicture ? { uri: profilePicture } : require('../assets/profilepic.jpg')}
            />
          </Pressable>
          <Text style={styles.textheader}>
            Safe-On-Chat
          </Text>
        </View>
        <View styles={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 50,
        }}>
          {/* <SearchBar
            round
            searchIcon={{ size: 24 }}
            placeholder="Search"
            onChangeText={(text) => setUserInput(text)}
            value={userInput}
            containerStyle={{
              backgroundColor: 'transparent',
              borderBottomWidth: 0,
              borderTopWidth: 0,
            }}
            inputStyle={{
              fontFamily: 'TitilliumWeb_400Regular',
            }}
            underlineColorAndroid={'transparent'}
          /> */}
        </View>
        {filteredUsers.length === 0 ? (
          <View style={{
            flex: 1,
            marginTop: 125,
          }}>
            <Text style={styles.temp_text}>Your Call History Is Empty. </Text>
            <Text style={styles.temp_text}>Initiate Your First Call. </Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredUsers}
            renderItem={({ item }) => <Item user={item} />}
            keyExtractor={item => item.id}
            style={{ marginTop: 10, paddingBottom: 10 }}
          />
        )}
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
    paddingTop: 10,
    paddingBottom: 0,
    paddingLeft: 10,
    padding: 10,
  },
  textheader: {
    fontFamily: 'TitilliumWeb_400Regular',
    fontSize: 25,
    color: 'hsl(0, 0%, 100%)',
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
    paddingTop: 15,
    paddingBottom: 10,
  },
  temp_text: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 25,
    color: '#fff',
    textAlign: 'center',
  },
  //!  FOR THE FLATLIST
  item: {
    flexDirection: 'row',
    backgroundColor: '#eef',
    paddingLeft: 10,
    padding: 5,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 30,
  },
  title: {
    fontSize: 20,
    fontFamily: 'TitilliumWeb_400Regular',
    paddingLeft: 10,
    textAlignVertical: 'center',
  },
})

export default Calls;