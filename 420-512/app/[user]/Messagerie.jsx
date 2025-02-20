

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList , Image, TouchableOpacity} from 'react-native';
import { getConversation, fetchProfileData, addConversation, getToken, getIdFromJwt } from '../../lib/axios';
import 'nativewind';

const Messagerie = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [participants1,paticipants2] = useState([]);
  const [userId, setUserId] = useState([])
  const currentUserId = 36; // Consider making this dynamic or from props/context

  const getId= async  () =>{
    const jwt = await getIdFromJwt();
    setUserId(jwt);
     
  }
  useEffect(()  => {
    fetchConversations();
    getId();
    
    

  }, []);

  const fetchConversations = async () => {
    try {
      const response = await getConversation(userId); 
      if (response?.data) {
        setConversations(response.data);
        await fetchUsers(response.data);
       
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchUsers = async (conversations) => {
    const userDetails = { ...users };
    
    const userPromises = conversations.map(async (convo) => {
      const participantId = convo.participants.find(id => id !== userId);
      if (participantId && !userDetails[participantId]) {
        try {
          const response = await fetchProfileData(participantId);
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
  

  const renderConversation = ({ item }) => {
    const participantId = item.participants.find(id => id !== userId);
    const user = users[participantId];
    
    
    return (
      
      <TouchableOpacity>
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
      </TouchableOpacity>
    );
  };
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
