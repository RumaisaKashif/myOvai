import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const backendUrl = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:5001';

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      setMessages([
        {
          id: Date.now().toString(),
          text: 'Hi! I’m your myOvai assistant. Ask me questions about your menstrual health, e.g. “Why do I feel bloated?”\n\nNote: This is not medical advice.',
          isUser: false,
        },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await axios.post(`${backendUrl}/chat`, {
        prompt: inputText.trim(),
      });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || 'Sorry, I couldn’t process that. Try again!',
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Oops, something went wrong. Please try again later.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
      {item.isUser ? (
        <Text style={[styles.messageText, styles.userMessageText]}>{item.text}</Text>
      ) : (
        <Markdown
          style={{
            body: styles.botMarkdownText,
            strong: { fontWeight: 'bold' },
            em: { fontStyle: 'italic' },
            list_item: { marginVertical: 2 },
            bullet_list: { marginLeft: 10 },
            ordered_list: { marginLeft: 10 },
          }}
        >
          {item.text}
        </Markdown>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
      style={styles.chatContainer}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
          placeholderTextColor="#2D1B3D80"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messageList: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#2D1B3D',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(45, 27, 61, 0.1)',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#2D1B3D',
  },
  botMarkdownText: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#2D1B3D',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 0,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#2D1B3D',
  },
  sendButton: {
    backgroundColor: 'rgba(45, 27, 61, 0.85)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
});

export default Chatbot;