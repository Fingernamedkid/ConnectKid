import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { getMessages, sendMessages } from '../../lib/axios';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useUserId } from '../../contexts/UserIdContext';
const ChatPage = () => {
  const router = useRouter();
  const { userId } = useUserId();
  const { conversationId, username, sender } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [numero, setNumero] = useState('');

  useEffect(() => {
    if (!conversationId) return;
    getMessagesText();
  }, [conversationId]);

  const getMessagesText = async () => {
    try {
      const response = await getMessages(conversationId);
      if (response && response.data) {
        const sortedMessages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);
        if (sortedMessages.length > 0 && sortedMessages[0].sender) {
          setNumero('0123456789');
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessageText = async () => {
    if (!message.trim()) return;
    try {
      const newMessage = await sendMessages(sender, conversationId, message);
      if (newMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const appelerUnAmi = () => {
    if (!numero) {
      console.error("Aucun numéro disponible");
      return;
    }
    
    try {
      Linking.openURL(`tel:${numero}`);
    } catch (error) {
      console.error("Erreur lors de l'appel", error);
    }
  };

  const goBackToConversations = () => {
    if (userId) {
      router.push(`/${userId}/Messagerie`);
    } else {
      router.push('/auth/signin');
    }
    
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-1 bg-white rounded-lg shadow-lg p-4">
        <View className="flex-row items-center mb-4">
          <View className="flex-1 items-center">
            <Text className="text-xl font-semibold text-gray-700">{username}</Text>
          </View>
          <TouchableOpacity onPress={goBackToConversations} className="p-2">
            <Text className="text-gray-500">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={appelerUnAmi} className="p-2">
            <Text className="text-gray-500">Appel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="space-y-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map((msg, index) => (
            <View key={index} className={`flex-row ${msg.sender == sender ? 'justify-end' : 'justify-start'}`}>
              <View className={msg?.sender == sender ? 'bg-teal-500 p-2 rounded-lg' : 'bg-gray-200 p-2 rounded-lg'}>
                <Text className={msg?.sender == sender ? 'text-white' : 'text-black'}>{msg.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row items-center mt-4">
          <TextInput
            className="flex-1 border p-2 rounded-lg bg-gray-50"
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message"
          />
          <TouchableOpacity onPress={sendMessageText} className="ml-2 p-2">
            <Text className="text-blue-500">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;