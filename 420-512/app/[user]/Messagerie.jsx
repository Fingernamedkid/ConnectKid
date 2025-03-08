import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { getConversation, fetchProfileData, getIdFromJwt, fetchContacts,addConversation } from '../../lib/axios';
import { useRouter } from 'expo-router';

const CreateConversationModal = ({ visible, onClose, onCreateConversation, userId }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchContacts();
      
      // Validate and transform contacts data
      let contactsArray = [];
      if (response && typeof response === 'object') {
        // If response is an object with data property
        if (Array.isArray(response.data)) {
          contactsArray = response.data;
        } 
        // If response is directly an array
        else if (Array.isArray(response)) {
          contactsArray = response;
        }
        // If response is an object with nested contacts
        else if (response.contacts && Array.isArray(response.contacts)) {
          contactsArray = response.contacts;
        }
      }
      
      setContacts(contactsArray);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setError('Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContacts = () => {
    if (!Array.isArray(contacts)) return [];
    
    return contacts.filter(contact => {
      if (!contact) return false;
      const username = contact.username || '';
      return username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const renderContact = ({ item }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity 
      onPress={() => onCreateConversation(item)}
      className="p-4 flex-row items-center border-b border-gray-200"
    >
      {item.image64 ? (
        <Image 
          source={{ uri: item.image64 }}
          className="w-12 h-12 rounded-full mr-3"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 justify-center items-center">
          <Text className="text-gray-600 font-bold">
            {(item.username || '?')[0]?.toUpperCase()}
          </Text>
        </View>
      )}
      <View>
        <Text className="text-lg font-semibold">{item.username || 'Unknown User'}</Text>
        <Text className="text-gray-500">{item.email || 'No email'}</Text>
      </View>
    </TouchableOpacity>
    );
  };

  const filteredContacts = getFilteredContacts();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50">
        <View className="flex-1 mt-24 bg-white rounded-t-3xl">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold">New Conversation</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-blue-500 text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="mt-4 p-3 bg-gray-100 rounded-lg"
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <Text>Loading contacts...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-red-500">{error}</Text>
              <TouchableOpacity 
                onPress={loadContacts}
                className="mt-4 p-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              renderItem={renderContact}
              keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-4">
                  {searchQuery ? 'No matching contacts found' : 'No contacts available'}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
const Messagerie = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [userId, setUserId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const getId = async () => {
    const jwt = await getIdFromJwt();
    setUserId(jwt);
  };

  useEffect(() => {
    const initializeData = async () => {
      await getId();
      await fetchConversations();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
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
    setUsers(userDetails);
  };

  const handleCreateConversation = async (contact) => {
    try {
      // Here you would typically call an API to create a new conversation
      // For now, we'll just close the modal and refresh conversations
      console.log('Creating conversation with:', contact._id);
      const response = await addConversation(userId, contact._id);

      console.log(response)
      setIsModalVisible(false);
      await fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const chatPage = (conversationId, username, number) => {
    router.push({
      pathname: '/chatPage',
      params: {
        conversationId,
        username,
        sender: userId,
        number
      }
    });
  };

  const getLastMessageText = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    if (typeof lastMessage === 'string') return lastMessage;
    if (typeof lastMessage === 'object' && lastMessage.content) {
      return lastMessage.content;
    }
    return 'No messages yet';
  };

  const renderConversation = ({ item }) => {
    const participantId = item.participants.find(id => id !== userId);
    const user = users[participantId];
    const messageText = getLastMessageText(item.lastMessage);
    console.log(user)
    return (
      <TouchableOpacity onPress={() => chatPage(item.id, user?.username, user?.phonenum)}>
        <View className="mb-4 p-4 bg-white rounded-lg shadow">
          <View className="flex-row items-center">
            {user?.image64 ? (
              <Image 
                source={{ uri: "data:image/jpeg;base64,"+user.image64 }}
                className="w-12 h-12 rounded-full mr-3"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-300 mr-3 justify-center items-center">
                <Text className="text-gray-600 font-bold">{user?.username?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-semibold">
                {user?.username || 'Unknown User'}
              </Text>
              <Text className="text-gray-700 mt-1" numberOfLines={1}>
                {messageText}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1">
      <View className="p-4 border-b border-gray-200">
        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded-lg"
          onPress={() => setIsModalVisible(true)}
        >
          <Text className="text-white text-center font-semibold">
            Create a new conversation
          </Text>
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

      <CreateConversationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCreateConversation={handleCreateConversation}
        userId={userId}
      />
    </View>
  );
};

export default Messagerie;// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
// import { getConversation, fetchProfileData, getIdFromJwt } from '../../lib/axios';
// import { useRouter } from 'expo-router';

// const Messagerie = () => {
//   const [conversations, setConversations] = useState([]);
//   const [users, setUsers] = useState({});
//   const [userId, setUserId] = useState(null);
//   const router = useRouter();

//   const getId = async () => {
//     const jwt = await getIdFromJwt();
//     setUserId(jwt);
//   };

//   useEffect(() => {
//     const initializeData = async () => {
//       await getId();
//       await fetchConversations();
//     };
//     initializeData();
//   }, []);

//   useEffect(() => {
//     if (userId) {
//       fetchConversations();
//     }
//   }, [userId]);

//   const fetchConversations = async () => {
//     if (!userId) return;
//     try {
//       const response = await getConversation(userId);
//       if (response?.data) {
//         setConversations(response.data);
//         await fetchUsers(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching conversations:', error);
//       setConversations([]);
//     }
//   };
//   const fetchContacts = () =>{

//   }

//   const fetchUsers = async (conversations) => {
//     const userDetails = { ...users };
//     const userPromises = conversations.map(async (convo) => {
//       const participantId = convo.participants.find(id => id !== userId);
//       if (participantId && !userDetails[participantId]) {
//         try {
//           const response = await fetchProfileData(participantId);
//           console.log(response)
//           if (response) {
//             userDetails[participantId] = response;
//           }
//         } catch (error) {
//           console.error(`Error fetching user ${participantId}:`, error);
//         }
//       }
//     });
//     await Promise.all(userPromises);
//     setUsers(userDetails);
//   };

//   const chatPage = (conversationId, username) => {
//     router.push({
//       pathname: '/chatPage',
//       params: {
//         conversationId,
//         username,
//         sender: userId
//       }
//     });
//   };

//   const getLastMessageText = (lastMessage) => {
//     if (!lastMessage) return 'No messages yet';
//     if (typeof lastMessage === 'string') return lastMessage;
//     if (typeof lastMessage === 'object' && lastMessage.content) {
//       return lastMessage.content;
//     }
//     return 'No messages yet';
//   };

//   const renderConversation = ({ item }) => {
//     const participantId = item.participants.find(id => id !== userId);
//     const user = users[participantId];
//     const messageText = getLastMessageText(item.lastMessage);

//     return (
//       <TouchableOpacity onPress={() => chatPage(item.id, user?.username)}>
//         <View className="mb-4 p-4 bg-white rounded-lg shadow">
//           <View className="flex-row items-center">
//             {user?.image64 && (
//               <Image 
//                 source={{ uri: user.image64 }}
//                 className="w-12 h-12 rounded-full mr-3"
//               />
//             )}
//             <View className="flex-1">
//               <Text className="text-lg font-semibold">
//                 {user?.username || 'Unknown User'}
//               </Text>
//               <Text className="text-gray-700 mt-1" numberOfLines={1}>
//                 {messageText}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View className="flex-1">
//       <View className="p-4 border-b border-gray-200">
//         <TouchableOpacity className="bg-blue-500 p-3 rounded-lg">
//           <Text className="text-white text-center font-semibold">
//             Create a new conversation
//           </Text>
//         </TouchableOpacity>
//       </View>
//       <View className="flex-1 bg-gray-100 p-4">
//         <FlatList
//           data={conversations}
//           keyExtractor={(item) => item._id?.toString()}
//           renderItem={renderConversation}
//           ListEmptyComponent={
//             <Text className="text-center text-gray-500">
//               No conversations found
//             </Text>
//           }
//         />
//       </View>
//     </View>
//   );
// };

// export default Messagerie;