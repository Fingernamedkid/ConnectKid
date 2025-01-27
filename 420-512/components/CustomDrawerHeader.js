// CustomDrawerHeader.js
import React from 'react';
import {Text, StyleSheet,TouchableOpacity} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colorsPalette } from '../assets/colorsPalette';
import Icon from 'react-native-vector-icons/FontAwesome5';


const CustomDrawerHeader = ({navigation, tabName}) => {
  const { theme, toggleTheme} = useTheme();
  const colors = colorsPalette[theme];
  return (
    <SafeAreaView style={[styles.header,{backgroundColor:colors.background}]}>
        
        <TouchableOpacity style={[styles.content]} onPress={() => {navigation.openDrawer();}}>
        <Text>
            <Icon name="bars" size={30} color={colors.text}/>
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.title,{color:colors.text}]}>{tabName}</Text>
      <TouchableOpacity style={[styles.content]} onPress={() => {toggleTheme()}}>
        <Text>
            <Icon name={theme == 'light' ? "moon" : "sun"} size={30} color={colors.text}/>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width:'100%',
    justifyContent:'space-between'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content:{
    heigth:56,
    width:56,
    justifyContent:"center",
    alignItems:"center",
    fontSize:30
  }
});

export default CustomDrawerHeader;