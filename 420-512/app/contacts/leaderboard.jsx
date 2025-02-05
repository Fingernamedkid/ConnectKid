import { Image, Text, View, FlatList, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import { useLeaderboard } from '../../contexts/LeaderboardContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

const Leaderboard = () => {
  const { theme } = useTheme();
  const colors = colorsPalette[theme];

  const router = useRouter();
  const [enfant, setEnfant] = ""

  
  const handleNamePress = (userId) => {
    console.log('Pressed on user:', userId, 'Redirecting to profile view of user ', userId);
    router.push(`/${userId}/profileView`);
  };


  
  return (
    <View className="h-full pb-16" style={{ backgroundColor: colors.background_c1 }}>
      <Text>Ou est,{enfant}</Text>
      
      
      
    </View>
  );
};

export default Leaderboard;
