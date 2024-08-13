import React, { useEffect, useState, useCallback } from 'react'
import { BackHandler, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPenToSquare, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { SearchBar } from '@rneui/themed';
// import RSA from 'react-native-rsa-native';
// import * as SecureStore from 'expo-secure-store';
global.Buffer = require('buffer').Buffer;

const Item = ({ user, auth, onPress }) => (
  <Pressable onPress={() => onPress(user)}>
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
            paddingTop: 5,
            textAlignVertical: 'center',
          }}>{user.username}</Text>
          <Text style={{
            fontFamily: 'TitilliumWeb_400Regular',
            fontSize: 15,
            paddingLeft: 10,
            paddingBottom: 5,
            textAlignVertical: 'center',
            color: '#777',
          }}>
            {user.recentMessage
              ? (user.isSentByCurrentUser ? 'You: ' : '') + user.recentMessage
              : 'No messages yet'}
          </Text>
        </View>
      </View>
    </View>
  </Pressable >
);

const Chats = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [userInput, setUserInput] = useState('');
  const [users, setUsers] = useState([]);
  const [lastClickedUser, setLastClickedUser] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // const fetchUsers = async () => {
  //   try {
  //     const usersCollection = collection(firestore, 'users');
  //     const userSnapshot = await getDocs(usersCollection);
  //     const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //     setUsers(userList);
  //     setFilteredUsers(userList);
  //   } catch (error) {
  //     console.error('Error fetching users: ', error);
  //   }
  // };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const fetchUsersWithRecentMessages = async () => {
    try {

      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = await Promise.all(
        userSnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const participantIds = [auth.currentUser.uid, doc.id].sort().join('_');
          const recentMessageQuery = query(
            collection(firestore, 'chats'),
            where('participants', '==', participantIds),
            orderBy('createdAt', 'desc'),
            limit(1)
          );

          const recentMessageSnapshot = await getDocs(recentMessageQuery);
          if (recentMessageSnapshot.docs.length === 0) {
            return null;
          }

          const recentMessageData = recentMessageSnapshot.docs[0].data()

          let decryptedMessage = '';
          if (recentMessageData._sender) {
            // decryptedMessage = await decryptMessage(recentMessageData._sender, privateKey);
            decryptedMessage = Buffer.from(recentMessageData._sender, 'base64').toString('utf-8');
          }

          return {
            id: doc.id,
            ...userData,
            recentMessage: decryptedMessage,
            isSentByCurrentUser: recentMessageData.sender === auth.currentUser.uid,
          };
        })
      );
      const filteredUserList = userList.filter(user => user != null);
      setUsers(filteredUserList);
      setFilteredUsers(filteredUserList);
    } catch (error) {
      console.error('Error fetching users with recent messages: ', error);
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
      // fetchUsers();
      fetchUsersWithRecentMessages();
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => user.username.toLowerCase().includes(userInput.toLowerCase()))
    );
  }, [userInput, users]);

  const navigation = useNavigation();

  const handleUserPress = (user) => {
    if (user.uid) {
      setLastClickedUser(user.id);
      navigation.navigate('ChatScreen', { user, username: user.username, profilePicture: user.profilePicture, uid: user.uid });
    } else {
      console.error('User does not have a valid UID');
    }
  };

  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
  });


  if (!fontsLoaded && !fontError) {
    return null;
  }

  const sortedUsers = filteredUsers.slice().sort((a, b) => {
    if (a.id === lastClickedUser) return -1;
    if (b.id === lastClickedUser) return 1;
    return 0;
  });

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
          <SearchBar
            round
            searchIcon={{ size: 24 }}
            placeholder=" Search"
            onChangeText={(text) => setUserInput(text)}
            value={userInput}
            containerStyle={{
              backgroundColor: 'transparent',
              borderBottomWidth: 0,
              borderTopWidth: 0,
            }}
            inputStyle={{
              color: '#fff',
              fontFamily: 'TitilliumWeb_400Regular',
            }}
            underlineColorAndroid={'transparent'}
            cursorColor={'#fff'}
          />
        </View>
        <View>
          <Pressable
            onPress={() =>
              navigation.navigate('GroupChats')
            }
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? '#4c669f'
                  : 'white',
                borderColor: pressed
                  ? 'white'
                  : '#4c669f',
                borderWidth: 1,
              },
              {
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginVertical: 10,
                marginHorizontal: 10,
                borderRadius: 10,
              }
            ]}
          >
            {({ pressed }) => (
              <View style={{
                flexDirection: 'row',
                paddingVertical: 2.5,
                paddingHorizontal: 5,
              }}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 2.5,
                    paddingHorizontal: 5,
                  }}
                >
                  <FontAwesomeIcon icon={faUserGroup} size={30} color={pressed ? 'white' : '#4c669f'} />
                </View>
                <View>
                  <Text style={{
                    fontFamily: 'TitilliumWeb_400Regular',
                    fontSize: 20,
                    paddingLeft: 10,
                    paddingVertical: 10,
                    textAlignVertical: 'center',
                    color: pressed
                      ? '#fff'
                      : '#4c669f',
                  }}>Group Chats</Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>
        {filteredUsers.length === 0 ? (
          <View style={{
            flex: 1,
            marginTop: 125,
          }}>
            <Text style={styles.temp_text}>No Conversations Found </Text>
            <Text style={styles.temp_text}>Start a New Chat. </Text>
          </View>
        ) : (
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={'#f0ceff'}
                titleColor={'#f0ceff'}
                title={'Loading...'}
                colors={['#4c669f']}
                progressBackgroundColor={'#f0ceff'}
                progressViewOffset={20}
              />
            }
            showsVerticalScrollIndicator={false}
            data={sortedUsers}
            renderItem={({ item }) => <Item user={item} onPress={handleUserPress} />}
            keyExtractor={item => item.id}
            style={{ marginTop: 10, paddingBottom: 10 }}
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            right: 0,
            margin: 20,
            backgroundColor: '#4c669f',
            borderRadius: 50,
            padding: 20,
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              }
            ]}
            onPress={() => {
              navigation.navigate("SearchChat")
            }
            }>
            <FontAwesomeIcon icon={faPenToSquare} color="#f0ceff" size={25} style={{ alignContent: 'center' }} />
          </Pressable>
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
  // image: {
  //   width: 50,
  //   height: 50,
  //   borderRadius: 40,
  // },
  // chat: {
  //   fontSize: 15,
  //   paddingLeft: 10,
  //   color: "#777",
  //   fontFamily: 'TitilliumWeb_600SemiBold',
  // },
  // imageContainer: {
  //   position: 'relative',
  // },
  // onlineIndicator: {
  //   position: 'absolute',
  //   right: 1, 
  //   top: 3, 
  //   width: 10, 
  //   height: 10,
  //   borderRadius: 7.5, 
  //   backgroundColor: '#00dd00',
  // },
})

export default Chats;