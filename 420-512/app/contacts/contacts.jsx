import { Image, Text, View, FlatList, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { fetchContacts } from '../../lib/axios';
const Conatct = () => {
  useEffect(() => {
    const checkJwt = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to check JWT:', error);
      }
    };
    checkJwt();
  }, []);
  const { theme } = useTheme();
  const colors = colorsPalette[theme];
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  useFocusEffect(
    useCallback(() => {
      const fetchContact = async () => {
        try {
          const fetchcontacts = await fetchContacts();
          setContacts(fetchcontacts);
          console.log(contacts)
        } catch (error) {
          console.error('Failed to load contacts:', error);
        }
      };
      fetchContact();
    }, [])
  );
  
  const handleNamePress = (userId) => {
    console.log('Pressed on user:', userId, 'Redirecting to profile view of user ', userId);
    router.push(`/message/${userId}`);
  };

  const renderBlock = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleNamePress(item._id)}>
        <View className="flex-row items-center w-full py-2 px-4">
          
          <Image
            className="w-16 h-16 rounded-full"
            source={{ uri: `data:image/jpg;base64,${item.image64}` }}
          />
          <Text className="ml-3 flex-1" style={{ color: colors.lightText }}>
            {item.username}
          </Text>
          
        </View>
      </TouchableOpacity>
    );
  };


  
  return (
    <View className="h-full pb-16" style={{ backgroundColor: colors.background_c1 }}>
      <View className="w-full">
        <View className="justify-center items-center py-5">
          <Text className="text-4xl font-medium px-16" style={{ color: colors.lightText }}>
            Contact
          </Text>
        </View>
        <FlatList
          data={contacts}
          renderItem={renderBlock}
          keyExtractor={(item) => item._id}/>
        
      </View>
      
    </View>
  );
};

export default Conatct;
