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
      <Icon className={"text-[180px]"} color={colors.primary} name="tools" />
      <View className={"items-center gap-2"} >

        <Text className={"text-3xl"} style={{color:colors.Text}}>
          Page en construction
        </Text>
        <Link href="/" style={{color:colors.link}}>
          Retourner à l'acceuil
        </Link>
      </View>
    </View>
  )
}

export default PageUnderConstruction

