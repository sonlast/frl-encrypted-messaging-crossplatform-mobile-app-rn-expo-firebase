import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text, Button, StyleSheet, Pressable } from 'react-native';
import { mediaDevices, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhoneSlash, faPhone } from '@fortawesome/free-solid-svg-icons';

const AudioCallScreen = ({ route, navigation }) => {
  const { user, username, profilePicture } = route.params;
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const socketRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const initializeSocket = () => {
      const socket = io('https://soc-system-rxo4.onrender.com');
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to signaling server');
        setIsConnected(true);
      });

      socket.on('offer', async (offer) => {
        console.log('Received offer:', offer);
        if (!pcRef.current) {
          pcRef.current = createPeerConnection();
        }
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('answer', answer);
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      });

      socket.on('answer', async (answer) => {
        console.log('Received answer:', answer);
        if (pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (error) {
            console.error('Error setting remote description:', error);
          }
        }
      });

      socket.on('ice-candidate', async (candidate) => {
        console.log('Received ICE candidate:', candidate);
        if (pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(candidate);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });

      return () => {
        socket.disconnect();
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
      };
    };

    initializeSocket();
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'closed') {
        console.log('Peer connection is closed');
      }
    };

    return pc;
  };

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
      });
      setLocalStream(stream);
      if (!pcRef.current) {
        pcRef.current = createPeerConnection();
      }
      stream.getTracks().forEach(track => {
        pcRef.current.addTrack(track, stream);
      });
      setCallStarted(true);
    } catch (error) {
      console.error('Error starting local stream:', error);
    }
  };

  const createOffer = async () => {
    if (!pcRef.current || pcRef.current.connectionState === 'closed') {
      console.warn('Peer connection is not available or closed');
      return;
    }

    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit('offer', offer);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    setCallStarted(false);
  };

  return (
    <View style={styles.container}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '50%',
      }}>
        {!callStarted ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 50,
            }}
          >
            <Image
              source={{ uri: profilePicture }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                marginBottom: 10,
              }}
            />
            <Pressable style={styles.button} onPress={startLocalStream}>
              <Text style={styles.buttonText}>Start Call</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 50,
              }}
            >
              <Image
                source={{ uri: profilePicture }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  marginBottom: 10,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginTop: 20,
                  width: '100%',
                }}
              >
                <Pressable style={{
                  ...styles.button,
                  backgroundColor: '#00ff66',
                }} onPress={createOffer}>
                  <FontAwesomeIcon icon={faPhone} size={40} color="#fff" />
                </Pressable>
                <Pressable style={{
                  ...styles.button,
                  backgroundColor: '#f44336',
                }} onPress={endCall}>
                  <FontAwesomeIcon icon={faPhoneSlash} size={40} color="#fff" />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#4c669f',
    position: 'relative',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00ff00',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'TitilliumWeb_600SemiBold',
  },
});

export default AudioCallScreen;
