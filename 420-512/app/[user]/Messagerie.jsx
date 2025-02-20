

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList , Image, TouchableOpacity} from 'react-native';
import { getConversation, fetchProfileData, addConversation } from '../../lib/axios';
import 'nativewind';

const Messagerie = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [participants1,paticipants2] = useState([]);
  const currentUserId = 36; // Consider making this dynamic or from props/context

  useEffect(() => {
    fetchConversations();
    console.log(conversations)
    
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await getConversation(37); // Why 37 when currentUserId is 36?
      if (response?.data) {
        setConversations(response.data);
        await fetchUsers(response.data);
        console.log(response.data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchUsers = async (conversations) => {
    const userDetails = { ...users };
    
    // Use Promise.all for parallel requests
    const userPromises = conversations.map(async (convo) => {
      const participantId = convo.participants.find(id => id !== currentUserId);
      if (participantId && !userDetails[participantId]) {
        try {
          const response = await fetchProfileData(participantId);
          console.log(response) // Should fetch participant ID, not currentUserId
          if (response) {
            userDetails[participantId] = response;
          }
          
        } catch (error) {
          console.error(`Error fetching user ${participantId}:`, error);
        }
      }
    });

    await Promise.all(userPromises);
    setUsers(userDetails)
    
    
    
  };
  const createConvos  = async () => {
    try {
      const response = await addConversation()
    } catch (error) {
      
    }
  } 

  const renderConversation = ({ item }) => {
    const participantId = item.participants.find(id => id !== currentUserId);
    console.log(item.lastMessage)
    const user = users[participantId];
    console.log(user)
    
    
    return (
      
      <View className="mb-4 p-4 bg-white rounded-lg shadow">
        <Image>
          {user?.image64}
        </Image>
        <Text className="text-lg font-semibold">
          {user?.username || 'Unknown User'}
        </Text>
        <Text className="text-gray-700">
          {item.lastMessage || 'No messages yet'}
        </Text>
        

      </View>
    );
  };
console.l
  return (
    <>
    <View>
      <TouchableOpacity >
        <Text>Create a new conversations</Text>
      </TouchableOpacity>

    </View>
      <View className="flex-1 bg-gray-100 p-4">
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderConversation}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">
              No conversations found
            </Text>
          }
        />
      </View> 
    </>
  );
};

export default Messagerie;
