import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChats = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);

  const addChat = (chat) => {
    setChats((prevChats) => [...prevChats, chat]);
  };

  return (
    <ChatContext.Provider value={{ chats, addChat }}>
      {children}
    </ChatContext.Provider>
  );
};