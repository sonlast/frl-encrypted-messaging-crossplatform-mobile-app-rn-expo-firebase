import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { BackHandler, Image, Text, View, StyleSheet, Pressable, Linking } from 'react-native';
import { app } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, orderBy, getDoc, doc, updateDoc, setDoc, serverTimestamp, query, onSnapshot, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperPlane, faPaperclip, faImage, faVideo, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Composer, GiftedChat, Bubble, MessageText, InputToolbar, Send, Day } from 'react-native-gifted-chat';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenCapture from 'expo-screen-capture';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
// import crypto from 'react-native-quick-crypto'; //! UNUSED DUE TO COMMENTED IMPLEMENTATION
import { RSA } from 'react-native-rsa-native';
import CryptoJS from 'react-native-crypto-js';
import { LogBox } from 'react-native';
global.Buffer = require('buffer').Buffer;

LogBox.ignoreLogs(['Warning...']);
LogBox.ignoreAllLogs();

const ChatScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const route = useRoute();
  const { user, profilePicture, username } = route.params;
  const participantIds = [auth.currentUser.uid, user.uid].sort().join('_');

  const VideoC = () => {
    navigation.navigate('VideoCall', { user, profilePicture });
  };

  const AudioC = () => {
    navigation.navigate('AudioCall', { user, profilePicture });
  }

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        //! Fetch public key from Firestore
        const publicKeyDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (publicKeyDoc.exists()) {
          setPublicKey(publicKeyDoc.data().publicKey);
          console.log('Public key fetched successfully', publicKeyDoc.data().publicKey);
        } else {
          console.error('Public key not found');
        }

        //! Fetch private key from AsyncStorage
        // const privateKey = await AsyncStorage.getItem('privateKey');

        //! Fetch private key from SecureStore
        const privateKey = await SecureStore.getItemAsync('privateKey');
        if (privateKey) {
          console.log('Private key fetched successfully', privateKey);
          setPrivateKey(privateKey);
        } else {
          console.error('Private key not found');
        }
      } catch (error) {
        console.error('Error fetching keys:', error);
      }
    };

    fetchKeys();
  }, []);

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
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderWithPicture username={username} profilePicture={profilePicture} />,
    });

    if (auth.currentUser && user && user.uid) {
      const q = query(
        collection(firestore, 'chats'),
        where('participants', '==', participantIds),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messagesFirestore = await Promise.all(snapshot.docs.map(async (doc) => {
          const data = doc.data();

          let decryptedText = '';
          if (data.text && data.aesKey) {
            // try {
              if (data.user._id !== auth.currentUser.uid) {
                const decryptedAesKeyBase64 = await RSA.decrypt(data.aesKey, privateKey); //! Decrypt AES key
                console.log('Decrypted AES key:', decryptedAesKeyBase64); 
                const decryptedAesKey = Buffer.from(decryptedAesKeyBase64, 'base64').toString('hex'); //!  Convert decrypted AES key to buffer 
                console.log('Decrypted AES key buffer:', decryptedAesKey); 
                const decryptedTextBytes = CryptoJS.AES.decrypt(data.text, decryptedAesKey); //! Decrypt text using decrypted AES key
                console.log('Decrypted text bytes:', decryptedTextBytes); 
                decryptedText = decryptedTextBytes.toString(CryptoJS.enc.Utf8); //! Convert decrypted text to string
                console.log('Decrypted text:', decryptedText);
                console.log('Decryption successful');
              } else {
                decryptedText = Buffer.from(data._sender, 'base64').toString('utf8'); //! Convert decrypted AES key to buffer 
              }
            // } catch (error) {
            //   console.error('Error decrypting text:', error.message);
            // }
          }

          return {
            _id: doc.id,
            text: decryptedText, //! Decrypted text
            // text: data.text,
            createdAt: data.createdAt.toDate(),
            user: {
              _id: data.user._id,
              name: data.user._id === auth.currentUser.uid
                ? username
                : user.username,
              avatar: data.user._id === auth.currentUser.uid
                ? (profilePicture || './assets/profilepic.jpg')
                : user.profilePicture,
            },
            file: data.file || null,
            fileType: data.fileType || null,
          };
        }));
        setMessages(messagesFirestore);
      });

      return () => {
        unsubscribe();
      };
    } else {
      console.error('Current user or chat participant is missing a UID');
    }
  }, [firestore, auth.currentUser, user, participantIds, privateKey]);

  useLayoutEffect(() => {
    if (auth.currentUser && user && user.uid) {
      const typingDocRef = doc(firestore, 'typingStatus', participantIds);

      const unsubscribe = onSnapshot(typingDocRef, (doc) => {
        const data = doc.data();
        if (data) {
          setIsTyping(!!data.typing && data.typing !== auth.currentUser.uid);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [firestore, auth.currentUser, user, participantIds]);

  const onSend = useCallback(async (messages = [], fileURL = null, fileType = null) => {
    const message = messages[0];

    if (!message || !message._id || !message.createdAt || (!message.text && !fileURL) || !message.user) {
      console.error('Invalid message format:', message);
      return;
    }

    const { _id, createdAt, text, user: sender } = message;

    if (!auth.currentUser.uid || !user.uid) {
      console.error('Either the current user or the chat participant does not have a valid UID');
      return;
    }

    try {
      const aesKey = CryptoJS.lib.WordArray.random(16).toString(); //! Generate random AES key
      console.log('AES key:', aesKey); 

      let encryptedText = '';
      if (text) {
        encryptedText = CryptoJS.AES.encrypt(text, aesKey).toString(); //! Encrypt text using AES key
        console.log('Encrypted text:', encryptedText); 
      }

      const aeseKeyBuffer = Buffer.from(aesKey, 'hex'); //! Convert AES key to buffer
      console.log('AES key buffer:', aeseKeyBuffer);
      const encryptedAesKey = await RSA.encrypt(aeseKeyBuffer.toString('base64'), publicKey); //! Encrypt AES key using RSA public key
      console.log('Encrypted AES key:', encryptedAesKey);

      const messageData = {
        _id,
        createdAt: new Date(),
        text: fileURL ? '' : encryptedText, //! Encrypted text
        aesKey: encryptedAesKey, //! Encrypted AES key
        user: {
          _id: sender._id,
          name: sender._id === auth.currentUser.uid ? username : user.username,
          avatar: sender._id === auth.currentUser.uid ? (profilePicture || './assets/profilepic.jpg') : user.profilePicture,
        },
        participants: participantIds,
        file: fileURL || null,
        fileType: fileType || null,
        _sender: Buffer.from(text, 'utf8').toString('base64'),
      };

      await addDoc(collection(firestore, 'chats'), messageData);
      console.log('Message sent successfully!');
      await setDoc(doc(firestore, 'typingStatus', participantIds), {
        typing: '',
        lastTyped: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  }, [auth.currentUser.uid, user.uid, firestore, participantIds, publicKey]);

  const handleInputTextChanged = async (text) => {
    const typingDocRef = doc(firestore, 'typingStatus', participantIds);

    if (text) {
      await setDoc(typingDocRef, {
        typing: auth.currentUser.uid,
        lastTyped: serverTimestamp(),
      }, { merge: true });
    } else {
      await updateDoc(typingDocRef, {
        typing: '',
        lastTyped: serverTimestamp(),
      });
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('Image picked:', imageUri);

        try {
          const fileURL = await uploadFile(imageUri, 'images');
          console.log('File URL:', fileURL);

          const message = {
            _id: new Date().getTime().toString(),
            createdAt: new Date(),
            user: {
              _id: auth.currentUser.uid,
              name: username,
              avatar: profilePicture || './assets/profilepic.jpg',
            },
            text: '',
          };
          onSend([message], fileURL, 'image');
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
        }
      } else {
        console.log('Image picking canceled or assets are missing');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const pickDocument = async () => {
    try {
      console.log('Picking document...');
      const result = await DocumentPicker.getDocumentAsync(
        {
          type: '*/*',
          copyToCacheDirectory: true,
          multiple: false,
        }
      );

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;

        try {

          const fileURL = await uploadFile(fileUri, 'documents');
          console.log('File URL obtained:', fileURL);
          const message = {
            _id: new Date().getTime().toString(),
            createdAt: new Date(),
            user: {
              _id: auth.currentUser.uid,
              name: username,
              avatar: profilePicture || './assets/profilepic.jpg',
            },
            text: '',
          };
          onSend([message], fileURL, 'document');
          console.log('Document message sent');
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
        }
      } else {
        console.log('Document picking canceled or assets are missing');
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const uploadFile = async (uri, fileType) => {
    try {
      console.log('Fetching file from URI:', uri);
      const response = await fetch(uri);

      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        throw new Error(`Fetch failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const storage = getStorage(app);
      const fileRef = ref(storage, `${fileType}/${new Date().getTime()}_${auth.currentUser.uid}`);

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      console.log('File uploaded successfully, download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  };

  const HeaderWithPicture = ({ username, profilePicture }) => {
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
      }}>
        <Image source={{ uri: profilePicture }} style={{
          width: 45,
          height: 45,
          borderRadius: 25,
          marginRight: 10,
        }} />
        <Text style={{
          color: '#fff',
          fontSize: 20,
          fontFamily: 'TitilliumWeb_600SemiBold',
        }}>{username}</Text>
        <Pressable
          style={{
            position: 'absolute',
            right: 140,
          }}
          onPress={AudioC}
        >
          <FontAwesomeIcon
            icon={faPhone}
            size={21}
            color='#fff'
          />
        </Pressable>
        <Pressable
          style={{
            position: 'absolute',
            right: 90,
          }}
          onPress={VideoC}
        >
          <FontAwesomeIcon
            icon={faVideo}
            size={25}
            color='#fff'
          />
        </Pressable>
      </View>
    );
  };

  const CustomMessageText = (props) => {
    return (
      <MessageText
        {...props}
        textStyle={{
          left: [styles.text, styles.textLeft],
          right: [styles.text, styles.textRight],
        }}
      />
    );
  };

  const CustomBubble = (props) => {
    return (
      <View>
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#fff',
              paddingHorizontal: 5,
            },
            left: {
              backgroundColor: '#fff',
              paddingHorizontal: 5,
            },
          }}
          renderTime={
            () => <Text style={[
              props.position === 'left' ? styles.timeLeft : styles.timeRight,
              styles.timeText,
            ]}>{props.currentMessage.createdAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}</Text>
          }
        />
        {props.currentMessage.fileType === 'image' && (
          <Image
            source={{ uri: props.currentMessage.file }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 20,
              marginTop: 5,
            }}
          />
        )}
        {props.currentMessage.fileType === 'document' && (
          <Text
            style={{
              color: '#4c669f',
              marginVertical: 10,
              backgroundColor: '#fff',
              textDecorationLine: 'underline',
              border: 1,
              borderColor: '#000',
              borderRadius: 22,
              paddingHorizontal: 15,
              paddingBottom: 5,
              paddingTop: 5,
              fontSize: 16,
              fontFamily: 'TitilliumWeb_400Regular',
            }}
            onPress={() => Linking.openURL(props.currentMessage.file)}
          >
            View Document.
          </Text>
        )}
      </View>
    );
  };

  const CustomInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          // backgroundColor: '#4c669f',
          maxHeight: 60,
          overflow: 'hidden',
        }}
        renderComposer={(composerprops) => (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
            <Pressable
              onPress={pickImage}
              style={{
                marginLeft: 1,
                marginRight: 10,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 5,
                padding: 5,
              }}
            >
              <FontAwesomeIcon icon={faImage} size={20} color='#000' />
            </Pressable>
            <Pressable
              onPress={pickDocument}
              style={{
                marginLeft: 3,
                marginRight: 5,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 5,
                padding: 5,
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} size={20} color='#000' />
            </Pressable>
            <Composer
              {...composerprops}
              textInputStyle={{
                color: '#000',
                fontFamily: 'TitilliumWeb_400Regular',
                flex: 1,
                multiline: true,
              }}
              placeholderTextColor='#000'
            />
          </View>
        )}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{
          marginRight: 10,
          marginBottom: 5,
          borderWidth: 1,
          borderColor: '#000',
          borderRadius: 5,
          padding: 5,
        }}>
          <FontAwesomeIcon icon={faPaperPlane} size={20} color='#000' />
        </View>
      </Send>
    );
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#f0ceff']}
      style={{ flex: 1 }}
      start={[0.5, 0.5]}
    >
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth.currentUser.uid,
          name: username,
          avatar: profilePicture || './assets/profilepic.jpg',
        }}
        renderBubble={CustomBubble}
        isTyping={isTyping}
        onInputTextChanged={handleInputTextChanged}
        renderMessageText={CustomMessageText}
        renderInputToolbar={CustomInputToolbar}
        renderAvatarOnTop={false}
        renderSend={renderSend}
        showAvatarForEveryMessage={false}
        renderDay={props => <Day {...props} textStyle={{
          color: '#fff',
          fontFamily: 'TitilliumWeb_400Regular',
          fontSize: 16,
        }}
        />}
        // renderUsernameOnMessage={true}
        renderChatEmpty={() => (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: '180deg' }],
          }}>
            <Image
              source={{ uri: user.profilePicture }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginBottom: 20,
                borderWidth: 3,
                borderColor: '#fff',
              }}
            />
            <Text style={{
              fontFamily: 'TitilliumWeb_600SemiBold',
              fontSize: 25,
              color: '#fff',
            }}>{user.username}</Text>
            <Text style={{
              fontFamily: 'TitilliumWeb_400Regular',
              fontSize: 16,
              color: '#fff',
              marginTop: 5,
            }}>Start a conversation!</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'TitilliumWeb_400Regular'
  },
  textLeft: {
    color: '#000',
  },
  textRight: {
    color: '#000',
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'TitilliumWeb_400Regular',
    marginHorizontal: 6,
  },
  timeLeft: {
    color: '#555',
  },
  timeRight: {
    color: '#555',
  },
});

export default ChatScreen;
