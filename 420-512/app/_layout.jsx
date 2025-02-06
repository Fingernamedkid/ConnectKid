import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserIdProvider } from '../contexts/UserIdContext';
import { LeaderboardProvider } from '../contexts/LeaderboardContext';
import CustomDrawerHeader from '../components/CustomDrawerHeader';

import "../global.css";

const RootLayout = () => {
  return (
    <ThemeProvider>
      <UserIdProvider>
          <Layout />
      </UserIdProvider>
    </ThemeProvider>
  );
};

const Layout = () => {
  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        screenOptions={{
          swipeEnabled: false,
          header: ({ navigation }) => <CustomDrawerHeader navigation={navigation} tabName={""} />,
        }}
      >
        <Drawer.Screen name={`[user]/viewProfile`} options={{ title: 'Your Profile' }} />
        <Drawer.Screen name="contacts/contacts" options={{ title: 'Contact' }} />
        <Drawer.Screen name={`[user]/profile`} options={{ title: 'Settings' }} />
        <Drawer.Screen name="camera/index" options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="auth"options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="index" options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="[user_id]/profileView" options={{drawerItemStyle: { display: 'none' }}} />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
