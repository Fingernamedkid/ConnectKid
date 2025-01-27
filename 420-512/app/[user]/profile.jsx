import { Image, Text, View, TextInput, ScrollView,TouchableOpacity, Modal, FlatList, Dimensions} from 'react-native'
import OverlayMessage from '../../components/OverlayMessage'
import React, { useEffect, useState, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { colorsPalette } from '../../assets/colorsPalette'
import Icon from 'react-native-vector-icons/FontAwesome5';
import { fetchProfileData, setToken, updateProfileData, deleteUserById } from '../../lib/axios'
import {useGlobalSearchParams, useRouter,useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Circle} from 'react-native-maps';

const WIDTH = Dimensions.get('window').width

const profile = () => {
  const { theme } = useTheme()
  const colors = colorsPalette[theme]
  const glob = useGlobalSearchParams();
  const router = useRouter()
  const refresh = useRef(false)
  const markerImage = require("../../assets/images/profile/logoMV.png")
  //Default Data
  const [username,setUsername] = useState("Default")
  const [email,setEmail] = useState('Default@abc.ca')
  const [profilePic, setProfilePic] = useState('')

  //States
  const [isEditing,setIsEditing] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false)
  //On mount 
  useEffect(() => {
    // Fetch profile data

      const loadData = async () => {
        try{
          const profileData = await fetchProfileData(glob.user);
          if(!profileData) throw new Error('Failed fetching data -> no Data')
          setUsername(profileData.username);
          setEmail(profileData.email);

          const photo = await AsyncStorage.getItem('photo');
          if(photo){
            // setProfilePic(profileData.profilePic);
            setProfilePic(photo)
            

          }
        }catch(error){
          console.log('Profile : Failed Loading profileData : ', error)
          router.push("/auth/signin")
        }
      };
      loadData();
    
    setIsMounted(true); 

    return () => {
      setIsMounted(false); // Clean up on unmount
    };
  }, []);
  useFocusEffect(() => {
    const load = async () => {
      const photo = await AsyncStorage.getItem('photo');
      if(photo){
        // setProfilePic(profileData.profilePic);
        setProfilePic(photo)
      }
    }
    if(refresh.current){
      load()
      refresh.current = false
    }


  })

  //Saves and gives a feedback to user
  const handleSave = async () => {
    
    isSaved = false
    const saveProfileData = async () => {
      
      const userData = {
        username,
        email,
        id: glob.user
      }
      try{
        isSaved = await updateProfileData(userData)
      }catch(error){
        console.log("Saving Error : " , error)
        isSaved = false
      }
      return isSaved
    }
    setIsEditSuccess(await saveProfileData())
    setMessageVisible(true);
    setTimeout(() => {
      setMessageVisible(false);
    }, 2000); 
   
  };

  //Handle changes in editing/non-editing mode
  useEffect(()=>{
    if(!isMounted) return
    if(!isEditing){
      handleSave()
    }
  },[isEditing,theme])

  //Should be in a component, but for today it will stay here
  //Item in the flat list rendering
  
  const supprimerUser = async () => {
    try{
      const deleteUser = await deleteUserById(glob.user)
      logOut()
    }catch(error){
      console.log(error)
    }
  }
  const logOut = () => {
    setToken('')
    router.push('/')
  }
  return (
    <>
      <ScrollView style={{backgroundColor:colors.background_c1}}>
        <View className="w-full" >
          <View className="justify-center items-center py-5">
            <TouchableOpacity 
              onPress={() => {refresh.current = true;router.push("../camera")} }
              className="rounded-full " 
              disabled={!isEditing} 
              style={isEditing ? {borderWidth:4, borderColor:colors.lightAlert} : {}}
            >
              {profilePic != "" ? 
                <Image 
                  className="w-40 h-40  rounded-full" 
                  source={{uri:profilePic}} /> 
                :
                <View className="w-40 h-40 rounded-full bg-gray-400 justify-center items-center mb-10">
                  <Text className=" text-white font-bold">
                    No profile picture
                  </Text>
                </View>
                }
              
            </TouchableOpacity>
            <View className="mt-10">
              {!isEditing ?
                <Text className="text-4xl font-medium px-16" style={{color:colors.primary}}>{username}</Text>
                :
                <TextInput
                className="justify-center text-center text-4xl font-medium px-16" 
                style={[{color:colors.primary, backgroundColor:colors.background_c1}]}
                onChangeText={(item) => {setUsername(item)}}
                placeholder="Entrez l'identifiant"
                placeholderTextColor={colors.secondary}
                value={username}
                />
            }
              
            </View>
          </View>
          <View className="items-center">
            <View className="items-center border rounded-md w-2/4" style={{borderColor:isEditing ?  colors.lightAlert :colors.primary}}>
              <Text className="absolute z-10 -top-2.5 left-3 px-1" style={{backgroundColor:colors.background_c1, color:colors.text}}>email</Text>
              {!isEditing ?
                <Text className="py-3 px-2" style={{color:colors.text}}>{email}</Text>
                :
                <TextInput
                  className="justify-center z-0 py-5 rounded-lg text-center w-full" 
                  style={[{color:colors.text, backgroundColor:colors.background_c1}]}
                  onChangeText={(item) => {setEmail(item)}}
                  placeholder="Entrez l'identifiant"
                  placeholderTextColor={colors.secondary}
                  value={email}
                />
            }
            </View>
          </View>
        </View>

        <View className="w-full h-80 border mt-10">
          <MapView
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: 45.61828,
              longitude: -73.60657,
              latitudeDelta: 0.15,
              longitudeDelta: 0.07,
            }}
            
          >
            <Marker
              coordinate={{latitude: 45.61828, longitude: -73.60657}}
            >
              <Image 
                className="rounded-full border-2 border-green-700"
                source={markerImage}
              />
            </Marker>
            <Circle 
              center={{latitude:45.61828,longitude:-73.60657}}
              radius={5000}
            />
          </MapView>
        </View>

        <View className="w-full items-center">
          <View className="flex-row justify-center items-center py-10 gap-5">
            <TouchableOpacity onPress={logOut} className="flex-row items-center justify-center w-1/3 p-2 rounded-md" style={{backgroundColor:colors.lightAlert}}>
              <Text className="pr-1" style={{color:colors.lightText}}>Déconnextion </Text>
              <Icon  name="sign-out-alt" size={30} color={colors.lightText} />
            </TouchableOpacity>  
            <TouchableOpacity onPress={()=>{setIsEditing((prev)=>{return !prev})}} className="flex-row items-center justify-center w-1/3 p-2 rounded-md" style={{backgroundColor:colors.lightAlert}}>
              <Text className="pr-1" style={{color:colors.lightText}}>Modifier </Text>
              <Icon  name="edit" size={30}  color={colors.lightText}/>
            </TouchableOpacity>  
          </View>
          <View className=""/>
          <TouchableOpacity onPress={supprimerUser} className="flex-row items-center justify-center w-1/3 p-2 rounded-md" style={{backgroundColor:colors.alert}}>
              <Text className="pr-1" style={{color:colors.lightText}}>Supprimer </Text>
              <Icon  name="trash-alt" size={30}  color={colors.lightText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <OverlayMessage
        message= {isEditSuccess ? "Changes saved successfully!" : "Error changes did not save"}
        styles={isEditSuccess ?   {backgroundColor:"#bbf7d0",borderColor:"#22c55e"}  : {backgroundColor:"#fecaca",borderColor:"#dc2626"} }
        visible={messageVisible}
        onDismiss={() => {setMessageVisible(false)}}
      />
     </>
    )
  }
  
  export default profile
  
