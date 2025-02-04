import { Image, Text, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import { fetchUserInfo } from '../../lib/axios';
import { useGlobalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileImageMapping } from '../../assets/images/profile/profileImageMapping';
import { StyleSheet } from 'react-native';
import { useUserId } from '../../contexts/UserIdContext';
const WIDTH = Dimensions.get('window').width;



const ProfileView = () => {
  const { theme } = useTheme();
  const colors = colorsPalette[theme];
  const glob = useGlobalSearchParams();
  const router = useRouter();
  const refresh = useRef(false);
  const {userId, setUserId} =  useUserId();
  // Default Data
  const [username, setUsername] = useState("Default");
  const [date, setDate] = useState('Default@abc.ca');
  const [description, setDescription] = useState('No description');
  const [profilePic, setProfilePic] = useState('');
  const [step, setStep] = useState(0);
  const [userLocations, setUserLocations] = useState([{ latitude: 0, longitude: 0 }]);
  const [locationList, setLocationList] = useState([]);
  const [locationIndex, setLocationIndex] = useState(0);
  const [isUser, setIsUser] = useState(false);
  // On mount effect
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    if (glob.user_id && !userId) {
      setUserId(glob.user_id);
    }
  }, [glob.user_id]);

  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        if (!glob.user_id) {
          console.log('Profile: userId is undefined');
          return;
        }
  
        try {
          const profileData = await fetchUserInfo(glob.user_id);
          if (!profileData) throw new Error('Failed fetching data -> no Data');
          setUsername(profileData.username);
          setDescription(profileData.description);
          setProfilePic(profileData.image64);
          setStep(profileData.steps?profileData.steps:0);
          if (profileData.routes && profileData.id == glob.user_id && profileData.routes.length > 0) {
            setDate(formatDate(profileData.routes[0].date));
            setUserLocations(profileData.routes[0].locations);
            setLocationList(profileData.routes);
            setLocationIndex(0);
            setIsUser(true);
          } else {
            setUserLocations([{ latitude: 0, longitude: 0 }]);
            setIsUser(false);
          }
        } catch (error) {
          console.log('Profile: Failed Loading profileData: ', error);
        }
      };
      loadProfileData();
    }, [glob.user_id]) // Only depend on user_id change
  );
  


  return (
    <ScrollView style={{ backgroundColor: colors.background_c1 }}>
      <View className="w-full">
        <View className="items-center mt-5">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Your Profile</Text>
        </View>
        <View className="justify-center items-center py-5">
            {profilePic !== "" ?
              <Image className="w-40 h-40 rounded-full" source={{ uri: `data:image/jpeg;base64, ${profilePic}` }} />
              :
              <View className="w-40 h-40 rounded-full bg-gray-400 justify-center items-center mb-10">
                <Text className="text-white font-bold">No profile picture</Text>
              </View>
            }
          <View className="mt-10">
            <Text className="text-4xl font-medium px-16" style={{ color: colors.primary }}>{username}</Text>
          </View>
        </View>

        <View className="items-center mt-5">
          <View className="items-center rounded-md w-2/4" style={{ borderColor: colors.primary }}>
            <Text className="absolute z-10 -top-2.5 left-3 px-1" style={{ backgroundColor: colors.background_c1, color: colors.text }}>Description :</Text>
            <Text className="py-3 px-2" style={{ color: colors.text }}>{description}</Text>
          </View>
        </View>

        <View className="items-center mt-5">
          <Text className="absolute z-10 px-1" style={{ backgroundColor: colors.background_c1, color: colors.text }}>{userLocations.length > 0 && isUser?"This session steps count is" : "The longest trip of this user is"}</Text>
          <View>
            <Text className="mt-5 text-4xl" style={{ color: colors.text }}>{step}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  stepsText: {
    fontSize: 24,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
  noLocationText: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default ProfileView;