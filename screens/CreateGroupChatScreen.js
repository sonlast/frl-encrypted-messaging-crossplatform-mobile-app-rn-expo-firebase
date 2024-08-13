import React, { useEffect, useState } from 'react';
import { BackHandler, View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { SearchBar } from '@rneui/themed';
import { Avatar } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const Item = ({ user, onPress, isSelected }) => (
  <Pressable
    onPress={() => onPress(user)}
  >
    <View
      onPress={() => onPress(user)}
      style={
        {
          backgroundColor: isSelected ? '#fff' : 'transparent',
          borderColor: '#fff',
          borderWidth: 2,
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginVertical: 10,
          marginHorizontal: 10,
          borderRadius: 10,
        }
      }
    >
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
            fontFamily: isSelected ? 'TitilliumWeb_400Regular' : 'TitilliumWeb_600SemiBold',
            fontSize: 20,
            paddingLeft: 10,
            paddingVertical: 10,
            textAlignVertical: 'center',
            color: isSelected ? '#000' : '#fff',
          }}>{user.username}</Text>
        </View>
      </View>
    </View>
  </Pressable>
);

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [profilePicture, setProfilePicture] = useState('');
  const auth = getAuth(app);
  const [users, setUsers] = useState([]); // Fetch the list of users from Firestore

  const firestore = getFirestore(app);

  const createGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      return; // Handle validation
    }
    try {
      const groupDocRef = await addDoc(collection(firestore, 'groups'), {
        name: groupName,
        participants: selectedUsers,
        createdAt: new Date(),
      });
      navigation.navigate('GroupChats', { groupId: groupDocRef.id, groupName}); // Navigate to the chat screen or group chat list
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error fetching users: ', error);
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

  useEffect(() => {
    fetchProfilePicture();
    fetchUsers();
    const backAction = () => {
      navigation.navigate("SearchChat");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => user.username.toLowerCase().includes(userInput.toLowerCase()))
    );
  }, [userInput, users]);

  const handleUserPress = (user) => {
    if (selectedUsers.includes(user.id)) {
      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user.id]);
    }
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
        style={styles.linearGradient}
        start={[0.5, 0.5]}
      >
        <View style={styles.content}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 5,
              alignItems: 'center',
            }}
          >
            <TextInput
              placeholder="Enter group name (required)"
              placeholderTextColor={'#fff'}
              underlineColorAndroid={'#fff'}
              value={groupName}
              onChangeText={setGroupName}
              style={{
                flex: 1,
                fontFamily: 'TitilliumWeb_400Regular',
                fontSize: 16,
                padding: 10,
                borderRadius: 5,
                marginBottom: 10,
                marginRight: 10,
                marginVertical: 10,
              }}
              cursorColor={'#fff'}
              color={'#fff'}
              autoCapitalize={'words'}
              autoFocus={true}
            />
            <Pressable
              onPress={createGroup}
            >
              {({ pressed }) => (
                <Text style={{
                  fontFamily: 'TitilliumWeb_600SemiBold',
                  fontSize: 14,
                  backgroundColor: pressed ? '#f0ceff' : '#fff',
                  textAlign: 'center',
                  padding: 13,
                  borderRadius: 5,
                }}>Create Group</Text>
              )}
            </Pressable>
          </View>
          <SearchBar
            round={true}
            platform='default'
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
          {filteredUsers.length === 0 ? (
            <View style={{
              flex: 1,
              marginTop: 125,
            }}>
              <Text style={styles.temp_text}>No Results Available. </Text>
            </View>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredUsers}
              renderItem={({ item }) => <Item
                user={item}
                onPress={handleUserPress}
                isSelected={selectedUsers.includes(item.id)}
              />}
              keyExtractor={item => item.id}
              style={{ marginTop: 10, paddingBottom: 10 }}
            />
          )}
          {/* <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedUsers([...selectedUsers, item.id])}>
                <Text>{item.username}</Text>
              </TouchableOpacity>
            )}
          /> */}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 0,
    padding: 10,
  },
  linearGradient: {
    flex: 1,
  },
  temp_text: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 25,
    color: '#fff',
    textAlign: 'center',
  },
});

export default CreateGroupScreen;
