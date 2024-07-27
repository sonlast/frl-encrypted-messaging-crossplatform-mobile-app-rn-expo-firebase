import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperPlane, faPaperclip, faImage, faVideo, faPhone } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, getDoc } from 'firebase/firestore';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_600SemiBold } from '@expo-google-fonts/titillium-web';
import * as ScreenCapture from "expo-screen-capture";
import { app } from '../firebaseConfig';
import { Avatar, Divider } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';

const GroupChatScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { groupId, groupName, } = route.params; // Pass groupId and groupName through route params
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const flatlistRef = useRef(null);

  useEffect(() => {
    const activateScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    const deactivateScreenCapture = async () => {
      await ScreenCapture.allowScreenCaptureAsync();
    };

    if (isFocused) {
      activateScreenCapture();
    } else {
      deactivateScreenCapture();
    }
  }, [isFocused]);
  
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Avatar rounded title={groupName[0]} size={40} containerStyle={{
          backgroundColor: getRandomColor(),
          marginRight: 15,
        }} />
      ),
      headerTitle: groupName,
      headerBackVisible: false,
    })
  }, [navigation, groupName]);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("GroupChats");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchMessagesWithUsernames = async () => {
      const messagesRef = collection(firestore, 'groups', groupId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messagesList = await Promise.all(snapshot.docs.map(async (msgDoc) => {
          const messageData = msgDoc.data();
          const userRef = doc(firestore, 'users', messageData.senderId);
          const userSnap = await getDoc(userRef);
          const username = userSnap.data().username;
          return {
            id: msgDoc.id,
            ...messageData,
            username: username,
          }
        }));
        setMessages(messagesList);
        flatlistRef.current?.scrollToEnd({ animated: true });
      });

      return () => unsubscribe();
    }
    fetchMessagesWithUsernames();
  }, [groupId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error('User not found');
        return;
      }

      const username = userSnap.data().username;

      const messagesRef = collection(firestore, 'groups', groupId, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        senderId: auth.currentUser.uid,
        username: username,
        createdAt: Timestamp.now(),
      });
      setMessageText('');
      console.log('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
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
        style={{ flex: 1 }}
        start={[0.5, 0.5]}
      >
        <FlatList
          ref={flatlistRef}
          data={messages}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.senderId === auth.currentUser.uid ? styles.currentUserMessage : styles.otherUserMessage
            ]}>
              <Text style={{
                fontSize: 16,
                fontFamily: 'TitilliumWeb_400Regular',
                alignSelf: item.senderId === auth.currentUser.uid ? 'flex-end' : 'flex-start',
              }}>{item.text}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 5,
                }}
              >
                <Text style={styles.messageText}>{item.username}</Text>
                <Divider 
                  orientation="vertical" 
                  width={1} 
                  style={{ backgroundColor: 'grey', marginHorizontal: 3 }}
                />
                <Text style={styles.messageTime}>{new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatlistRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            style={styles.input}
            placeholder="Type a message"
          />
          <Pressable onPress={sendMessage} style={styles.sendButton}>
            <FontAwesomeIcon icon={faPaperPlane} size={20} style={{ color: '#000' }} />
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
  groupName: {
    fontSize: 20,
    fontFamily: 'TitilliumWeb_600SemiBold',
    textAlign: 'center',
    marginVertical: 10,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'column',
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 20,
  },
  messageText: {
    color: '#666',
    fontSize: 12.5,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'TitilliumWeb_400Regular',
    textAlign: 'right',
    color: 'grey',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    padding: 5,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 5,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  sendButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginVertical: 5,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
});

export default GroupChatScreen;
