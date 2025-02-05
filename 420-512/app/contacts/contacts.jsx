import { Image, Text, View, FlatList, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

const Leaderboard = () => {
  const { theme } = useTheme();
  const colors = colorsPalette[theme];
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        fetchLeaderboard();
      }, 60000);
      return () => clearInterval(intervalId); 
    }, [fetchLeaderboard])
  );

  const handleNamePress = (userId) => {
    console.log('Pressed on user:', userId, 'Redirecting to profile view of user ', userId);
    router.push(`/${userId}/profileView`);
  };

  const renderBlock = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => handleNamePress(item._id)}>
        <View className="flex-row items-center w-full py-2 px-4">
          <Text className="mr-2" style={{ color: colors.lightText }}>
            {index + 1}
          </Text>
          <Image
            className="w-16 h-16 rounded-full"
            source={{ uri: `data:image/jpg;base64,${item.image64}` }}
          />
          <Text className="ml-3 flex-1" style={{ color: colors.lightText }}>
            {item.username}
          </Text>
          <Text className="ml-3" style={{ color: colors.lightText }}>
            {item.steps}
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

        <View className="flex-row justify-center py-3">
          <Button
            title={isLeastSteps ? "Show Top 10 Most Steps" : "Show Top 10 Least Steps"}
            onPress={toggleFilter}
          />
        </View>
      </View>
      
      <FlatList
        data={isLeastSteps ? leastBlocks : blocks} 
        keyExtractor={(item, index) => `${item._id}-${index}`}
        renderItem={renderBlock}
        className="flex-grow"
      />
    </View>
  );
};

export default Leaderboard;
