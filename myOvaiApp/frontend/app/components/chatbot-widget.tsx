import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatbotWidget = () => {
  const router = useRouter();

  const openChatbot = () => {
    router.push('../(tabs)/ai-chatbot');
  };

  return (
    <TouchableOpacity style={styles.widget} onPress={openChatbot}>
      <Icon name="chatbox-ellipses-outline" size={35} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widget: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: 'rgba(45, 27, 61, 0.85)',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChatbotWidget;