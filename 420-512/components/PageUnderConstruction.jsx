import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../contexts/ThemeContext';
import { colorsPalette } from '../assets/colorsPalette';
import { Link } from 'expo-router';
import tailwindConfig from '../tailwind.config';
const PageUnderConstruction = () => {
  const { theme } = useTheme()
  // const theme = "dark"
  const colors = colorsPalette[theme]
 
  return (
    <View className="flex-1 justify-center items-center gap-4" style={{backgroundColor:colors.background_c1}}>
      <Icon className={"text-[180px]"} color={colors.primary} name="phone" />
      <View className={"items-center gap-2"} >

        <Text className={"text-1xl align-center"} style={{color:colors.Text}}>
          Veuillez nous contactez au numéro suivant afin de récupérer votre mot de passe:
        </Text>
        <Text className={"text-4xl"} style={{color:colors.Text}}>
          911-213-1231
        </Text>
        <Link href="/" style={{color:colors.link}}>
          Retourner à l'acceuil
        </Link>
      </View>
    </View>
  )
}

export default PageUnderConstruction

