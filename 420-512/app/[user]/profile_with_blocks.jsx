import { Image, Text, View, TextInput, ScrollView,TouchableOpacity, Modal, FlatList, Dimensions} from 'react-native'
import OverlayMessage from '../../components/OverlayMessage'
import React, { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { colorsPalette } from '../../assets/colorsPalette'
import Icon from 'react-native-vector-icons/FontAwesome5';
import { fetchProfileData, setToken, updateProfileData, deleteUserById, fetchBlocks } from '../../lib/axios'
import {useGlobalSearchParams, useRouter } from 'expo-router';
import { ProfileImageMapping } from '../../assets/images/profile/profileImageMapping'

const WIDTH = Dimensions.get('window').width

const profile = () => {
  const {theme} = useTheme()
  const colors = colorsPalette[theme]
  const glob = useGlobalSearchParams();
  const route = useRouter()

  //Default Data
  const [username,setUsername] = useState("Default")
  const [email,setEmail] = useState('Default@abc.ca')
  const [profilePic, setProfilePic] = useState('chiot1')
  const [blocks, setBlocks] = useState([
  {
    id: 53,
    name: 'Blocknado',
    couleur: 4,
    description: 'The storm of blocks you never saw coming. It’s highly destructive.'
  },
  {
    id: 54,
    name: 'The Unblockable Block',
    couleur: 5,
    description: 'It’s always going to get in your way, whether you like it or not.'
  },
  {
    id: 55,
    name: 'Biscuit Block',
    couleur: 6,
    description: 'Flaky and buttery, this block is the ultimate breakfast companion.'
  },
  {
    id: 56,
    name: 'The Mighty Brickster',
    couleur: 7,
    description: 'Does push-ups for breakfast. Also, has a side hustle in stand-up comedy.'
  }])
  //States
  const [isEditing,setIsEditing] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditSuccess, setIsEditSuccess] = useState(false)
  //On mount 
  useEffect(() => {
    // Fetch profile data

      const loadProfileData = async () => {
        try{
          const profileData = await fetchProfileData(glob.user);
          if(!profileData) throw new Error('Failed fetching data -> no Data')
          setUsername(profileData.username);
          setEmail(profileData.email);
          if(profileData.profilePic){
            setProfilePic(profileData.profilePic);
          }
        }catch(error){
          console.log('Profile : Failed Loading profileData : ', error)
          route.push("/auth/signin")
        }
      };
      const loadBlocks = async () => {
        try{
          const blocks = await fetchBlocks();
          if(!blocks) throw new Error('Failed fetching blocks -> no Data')
          setBlocks(blocks)
        }catch(error){
          console.log('Profile : Failed Loading blocks : ', error)
        }
      };
      loadProfileData();
      loadBlocks();
    
    setIsMounted(true); 

    return () => {
      setIsMounted(false); // Clean up on unmount
    };
  }, []);

  //Saves and gives a feedback to user
  const handleSave = async () => {
    
    isSaved = false
    const saveProfileData = async () => {
      
      const userData = {
        username,
        email,
        profilePic,
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
  const renderItem = ({item}) =>{
    return (
      <TouchableOpacity onPress={()=>{setProfilePic(item.source)}} className="w-1/2">
        <Image source={ProfileImageMapping[item.source]} className="rounded-full" style={{width:(WIDTH-90)/2,height:(WIDTH-90)/2}}/>
      </TouchableOpacity>

    )
  }
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
    route.push('/')
  }

  const renderBlock = ({item}) => {
    return (
      <View className="flex-row w-full py-2 pl-16">
        <View className="w-4 h-full mx-3 rounded-full" style={{backgroundColor:colorMap[item.couleur]}}/>
        <Text style={{color:colors.text}}>{item.name}</Text>
      </View>
    )
  }
  const colorMap = {
    0:"gray",
    1:"purple",
    2:"blue",
    3:"green",
    4:"yellow",
    5:"pink",
    6:"red",
    7:"black"
  }
  return (
    <>
      <View className="h-full pb-16" style={{backgroundColor:colors.background_c1}}>
        <View className="w-full" >
          <View className="justify-center items-center py-5">
            <TouchableOpacity 
              onPress={() => setIsModalVisible(true)} 
              className="rounded-full " 
              disabled={!isEditing} 
              style={isEditing ? {borderWidth:4, borderColor:colors.lightAlert} : {}}
            >
              <Image 
                  className="w-40 h-40  rounded-full" 
                  source={ProfileImageMapping[profilePic]} />
            </TouchableOpacity>
            <View className="">
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
        <FlatList
          data={blocks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBlock}
          className="h-1/4"
        />

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
      </View>
      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        >
        
        <TouchableOpacity 
          style={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
          className="flex-1 items-center justify-end   " 
          onPress={() => setIsModalVisible(false)}
        >
          <View className="w-full h-1/3">
            <FlatList data={[{id:1,source:"chiot1"},{id:2,source:'chiot4'}]}
                      renderItem={renderItem}     
                      keyExtractor={item => item.id} 
                      className="flex-row pt-5"
                      horizontal={true}
                      contentContainerStyle={{paddingHorizontal:30, gap:30}}
                      style={{backgroundColor:colors.background}}
                      />
          </View>            
        </TouchableOpacity>
      </Modal>
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
  
