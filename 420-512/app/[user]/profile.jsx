import { Image, Text, View, TextInput, ScrollView, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import OverlayMessage from '../../components/OverlayMessage';
import { useTheme } from '../../contexts/ThemeContext';
import { colorsPalette } from '../../assets/colorsPalette';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { fetchProfileData, setToken, updateProfileData, deleteUserById } from '../../lib/axios';
import { useGlobalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileImageMapping } from '../../assets/images/profile/profileImageMapping';
import { useUserId } from '../../contexts/UserIdContext';
import Animated, { Easing, withTiming, useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

const WIDTH = Dimensions.get('window').width;

const Profile = () => {
  const { theme } = useTheme();
  const colors = colorsPalette[theme];
  const glob = useGlobalSearchParams();
  const router = useRouter();
  const refresh = useRef(false);
  const { userId, setUserId } = useUserId();

  // Default Data
  const [username, setUsername] = useState("Default");
  const [email, setEmail] = useState('Default@abc.ca');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [pairId, setpairId] = useState("PairId");
  const [type, setType]= useState("Parent")
  

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false);

  const spinValue = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinValue.value * 360}deg` }],
    };
  });

  const handleLogout = async () => {
    spinValue.value = 0;
    spinValue.value = withTiming(1, { duration: 1000, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(logOut)();
      }
    });
  };

  const logOut = async () => {
    setToken('');
    setUserId('');
    router.push('/');
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!glob.user && !userId) {
        console.log('Profile: userId is undefined');
        return;
      }
      try {
        console.log("Getting profile data of :", userId);
        const profileData = await fetchProfileData(glob.user || userId);
        if (!profileData) throw new Error('Failed fetching data -> no Data');
        setUsername(profileData.username);
        setEmail(profileData.email);
        setProfilePic(profileData.image64);
        setNumber(profileData.phonenum)
        setpairId(profileData.pairId?profileData.pairId:0);
        setType(profileData.type )
        
    
        if (profileData.image64) {
          console.log('Profile: Profile picture loaded');
          setProfilePic(profileData.image64);
        }
        if(userId) {
          await AsyncStorage.setItem('user_id', String(userId));
        }
      } catch (error) {
        console.log('Profile: Failed Loading profileData: ', error);
        // router.push("/auth/signin");
      }
    };
    loadProfileData();
    setIsMounted(true);
    return () => {
      setIsMounted(false); // Clean up on unmount
    };
  }, [glob.user, userId]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!glob.user && !userId ) {
          console.log(glob.user, userId);
          console.log('Profile: userId is undefined, or user is not logged in');
          return;
        }
        const idtofetch = glob.user || userId ;

        try {
          const photo = await AsyncStorage.getItem('photo');
          console.log("Getting profile data: ", idtofetch);
          const profileData = await fetchProfileData(idtofetch);
          const photoUpdated = await AsyncStorage.getItem('photoUpdated');
          console.log("photoUpdated: ", photoUpdated);  
          if (photoUpdated === 'true' && photo) {
            setProfilePic(photo);
            await AsyncStorage.setItem('photoUpdated', 'false');
          }
          if (profileData.steps != 0) {
            setStep(profileData.steps);
          }
        } catch (error) {
          console.log('Error fetching profile data:', error);
        }
      };
      load();
      if (refresh.current) {
        load();
        refresh.current = false;
      }
      return () => {
      };
    }, [glob.user, userId])
  );
  const handleSave = async () => {
    let isSaved = false;
    const saveProfileData = async () => {
      const userData = {
        username,
        email,
        number,
        profilePic: profilePic || '',
        id: userId || glob.user
      };
      try {
        isSaved = await updateProfileData(userData);
      } catch (error) {
        console.log("Saving Error: ", error);
        isSaved = false;
      }
      return isSaved;
    };
    setIsEditSuccess(await saveProfileData());
    if (isSaved) {
      try {
        await AsyncStorage.removeItem('photo');
      } catch (error) {
        console.log("Error clearing AsyncStorage: ", error);
      }
    }
    setMessageVisible(true);
    setTimeout(() => {
      setMessageVisible(false);
    }, 2000);
  };
  useEffect(() => {
    if (!isMounted) return;
    if (!isEditing) {
      handleSave();
    }
  }, [isEditing, theme]);

  // Delete User
  const supprimerUser = async () => {
    try {
      await deleteUserById(glob.user || userId);
      logOut();
    } catch (error) {
      console.log(error);
    }
  };

  // Duplicate logOut function removed

  // Render profile image item in modal
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => setProfilePic(item.source)} className="w-1/2">
      <Image source={ProfileImageMapping[item.source]} className="rounded-full" style={{ width: (WIDTH - 90) / 2, height: (WIDTH - 90) / 2 }} />
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={{ backgroundColor: colors.background_c1 }} className='justify-center items-center'>

        <View className="bg-white m-4 p-2 rounded-lg shadow-lg border border-gray-300"  style={{ height : 900, width : 600 }} >
          <View className="justify-center items-center py-3">
            <TouchableOpacity
              onPress={() => { refresh.current = true; router.push("../camera"); }}
              className="rounded-full"
              disabled={!isEditing}
              style={isEditing ? { borderWidth: 4, borderColor: colors.lightAlert } : {}}>
              {profilePic !== "" ?
                <Image className="w-40 h-40 rounded-full" source={{ uri: `data:image/jpeg;base64, ${profilePic}` }} style={{ width: 100, height: 100 }}/>   :

                <View className="w-40 h-40 rounded-full bg-gray-400 justify-center items-center mb-10">
                  <Text className="text-white font-bold">No profile picture</Text>
                </View>}
            </TouchableOpacity>
            <View className="mt-1">
              {!isEditing ? 
                <Text className="text-4xl font-medium" style={{ color: colors.primary }}>{username}</Text>:
                <TextInput className="justify-center text-center text-4xl font-medium px-16 rounded-md color-slate-400" style={[{ color: colors.primary, backgroundColor: colors.background_c1 }]} onChangeText={setUsername}
                  placeholder="Entrez l'identifiant"
                  placeholderTextColor={colors.secondary}
                  value={username}/>
              }
            </View>
          </View>
          <View className="items-center">
            <View className="items-center rounded-md w-2/4" style={{ borderColor: isEditing ? colors.lightAlert : colors.primary }}>
              <Text className="text-xl font-semibold justify-start p-2" style={{color: colors.text }}>Email: </Text>
              {!isEditing ?
                <View className ="border rounded-md  border-gray-300" style={{width : 300}}>
                  <Text className="py-3 px-2" style={{ color: colors.text }}>{email}</Text>
                </View>
                :
                <TextInput
                  className="justify-center z-0 py-5 rounded-lg text-center w-full"
                  style={[{ color: colors.text, backgroundColor: colors.background_c1 }]}
                  onChangeText={setEmail}
                  placeholder="Entrez l'identifiant"
                  placeholderTextColor={colors.secondary}
                  value={email}
                />}
            </View>
          </View>

          <View className="items-center mt-5">
            <View className="items-center rounded-md w-2/4" style={{ borderColor: isEditing ? colors.lightAlert : colors.primary }}>
              <Text className="text-xl font-semibold p-2" style={{ color: colors.text }}>Username : </Text>
              {!isEditing ?
                <View className ="border rounded-md border-gray-300" style={{width : 300}}>
                <Text className="py-3 px-2"  style={{ color: colors.text }}>{username}</Text>
                </View>
                :
                <TextInput
                  className="justify-center z-0 py-5 rounded-lg text-center w-full "
                  style={[{ color: colors.text, backgroundColor: colors.background_c1 }]}
                  onChangeText={setUsername}
                  placeholder="Entrez la username"
                  placeholderTextColor={colors.secondary}
                  value={username}
                />
              }
            </View>
          </View>
          
          <View className="items-center">
            <View className="items-center rounded-md w-2/4" style={{ borderColor: isEditing ? colors.lightAlert : colors.primary }}>
              <Text className="text-xl font-semibold p-2" style={{ color: colors.text }}>Role : </Text>
              <View className ="border rounded-md p-2  border-gray-300" style={{width : 300}}>
                {type}
              </View>
            </View>
          </View>
          <View className="items-center mt-5">
            <View className="items-center rounded-md w-2/4" style={{ borderColor: isEditing ? colors.lightAlert : colors.primary }}>
              <Text className="text-xl font-semibold p-2" style={{ color: colors.text }}> Your Pair Id : </Text>
              <View className ="border rounded-md p-2  border-gray-300 justify-center" style={{width : 75}}>
                {pairId}
              </View>
              
            </View>
          </View>
          <View className="w-full items-center">
            <View className="flex-row justify-center items-center py-10 gap-5">
          
                <TouchableOpacity onPress={handleLogout} className="flex-row items-center w-full justify-center h-full  p-2 rounded-md" style={{ backgroundColor: colors.lightAlert }}>
                  <Text className="pr-1" style={{ color: colors.lightText }}>Déconnexion</Text>
                  <Icon name="sign-out-alt" size={20} color={colors.lightText} />
                </TouchableOpacity>
              
              <TouchableOpacity onPress={() => { setIsEditing(prev => !prev); }} className="flex-row items-center w-full  justify-center  p-2 rounded-md" style={{ backgroundColor: colors.lightAlert }}>
                <Text className="pr-1" style={{ color: colors.lightText }}>Modifier</Text>
                <Icon name="edit" size={30} color={colors.lightText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={supprimerUser} className="flex-row items-center justify-center w-1/3 p-2 rounded-md" style={{ backgroundColor: colors.alert }}>
              <Text className="pr-1" style={{ color: colors.lightText }}>Supprimer</Text>
              <Icon name="trash-alt" size={30} color={colors.lightText} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableOpacity
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          className="flex-1 items-center justify-end"
          onPress={() => setIsModalVisible(false)}>
        </TouchableOpacity>
      </Modal>
      <OverlayMessage
        message={isEditSuccess ? "Changes saved successfully!" : "Error, changes did not save"}
        styles={isEditSuccess ? { backgroundColor: "#bbf7d0", borderColor: "#22c55e" } : { backgroundColor: "#fecaca", borderColor: "#dc2626" }}
        visible={messageVisible}
        onDismiss={() => { setMessageVisible(false); }}/>
    </>
  );
};
export default Profile;