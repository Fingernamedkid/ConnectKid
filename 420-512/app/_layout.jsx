import React from 'react'
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import CustomDrawerHeader from '../components/CustomDrawerHeader';

// Import your global CSS file
import "../global.css"; 

const RootLayout = () => {
  return (
    <ThemeProvider>
        <Layout/>
    </ThemeProvider>
  )
}
const Layout = () => {

  return (
    <>
        <GestureHandlerRootView className="flex-1" >
          <Drawer 
              screenOptions={{
                swipeEnabled:false,
                // headerShown:false,
                header: ({navigation}) => <CustomDrawerHeader navigation={navigation} tabName={""} />
              }
            }>
              <Drawer.Screen name="index" options={{headerShown:false}} />
              <Drawer.Screen name="camera/index" options={{headerShown:false}} />
              <Drawer.Screen name="auth" options={{headerShown:false}} />
          </Drawer>
        </GestureHandlerRootView>
    </>
  )
}

export default RootLayout

