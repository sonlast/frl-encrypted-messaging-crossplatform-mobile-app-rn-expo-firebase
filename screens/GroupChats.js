import React, { useEffect, useState, useCallback } from 'react';
import { BackHandler, View, Text, FlatList, Pressable, StyleSheet, LogBox, RefreshControl, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import { Avatar } from 'react-native-elements';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { app } from '../firebaseConfig';

LogBox.ignoreLogs(['Warning...']);
LogBox.ignoreAllLogs();

const GroupChatsScreen = () => {
  const [groupChats, setGroupChats] = useState([]);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroupChats().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
    })
  })

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Chats");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const fetchGroupChats = async () => {
    try {
      const groupChatsCollection = collection(firestore, 'groups');
      const groupChatsSnapshot = await getDocs(groupChatsCollection);
      const groupChatsList = groupChatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentUserId = auth.currentUser.uid;
      const userGroupChats = groupChatsList.filter(group => group.participants.includes(currentUserId));
      setGroupChats(userGroupChats);
    } catch (error) {
      console.error('Error fetching group chats: ', error);
    }
  };

  useEffect(() => {
    fetchGroupChats();
  }, []);


  const handleGroupChatPress = (group) => {
    navigation.navigate('GroupChatScreen', { groupId: group.id, groupName: group.name });
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
        style={{ flex: 1 }}
        start={[0.5, 0.5]}
      >
        <View
          style={styles.content}
        >
          {/* {groupChats.length === 0 ? (
            <View
              styles={{
                flex: 1,
                marginTop: 125,
              }}
            >
              <Text style={styles.temp_text}>No group chats joined.</Text>
              <Text style={{
                fontFamily: 'TitilliumWeb_600SemiBold',
                fontSize: 25,
                color: '#fff',
                textAlign: 'center',
              }}>Create one.</Text>
            </View>
          ) : ( */}
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
              ListEmptyComponent={
                <View style={{
                  flex: 1,
                  marginTop: 40,
                }}>
                  <Text style={styles.temp_text}>No group chats joined.</Text>
                  <Text style={{
                    fontFamily: 'TitilliumWeb_600SemiBold',
                    fontSize: 25,
                    color: '#fff',
                    textAlign: 'center',
                  }}>Create one.</Text>
                </View>
              }
              data={groupChats}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleGroupChatPress(item)
                  }>
                  <View style={styles.groupChatItem}>
                    <Avatar rounded title={item.name[0]} size={40} containerStyle={{
                      backgroundColor: getRandomColor(),
                      marginRight: 20,
                    }} />
                    <Text style={styles.groupChatName}>{item.name}</Text>
                  </View>
                </Pressable>
              )}
              keyExtractor={item => item.id}
            />
          {/* )} */}
          <Pressable
            onPress={
              () => navigation.navigate('CreateGroupChat')
            }
          >
            <FontAwesomeIcon icon={faPlus} size={50} color="#fff" style={{
              alignSelf: 'center',
              marginTop: 25,
              padding: 30,
              borderRadius: 50,
            }} />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  groupChatItem: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 15,
    paddingLeft: 20,
    backgroundColor: '#f0ceff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
  },
  groupChatName: {
    fontSize: 18,
    fontFamily: 'TitilliumWeb_600SemiBold',
    color: '#000',
  },
  temp_text: {
    fontFamily: 'TitilliumWeb_600SemiBold',
    fontSize: 25,
    color: '#fff',
    textAlign: 'center',
    marginTop: 125,
  },
});

export default GroupChatsScreen;
