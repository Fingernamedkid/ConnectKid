import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserIdProvider } from '../contexts/UserIdContext';
import { LeaderboardProvider } from '../contexts/LeaderboardContext';
import CustomDrawerHeader from '../components/CustomDrawerHeader';

import "../global.css";
import ChatPage from './chatPage';

const RootLayout = () => {
  return (
    <ThemeProvider>
      <UserIdProvider>
        <LeaderboardProvider> 
          <Layout />
        </LeaderboardProvider>
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
        <Drawer.Screen name="leaderboard/leaderboard" options={{ title: 'Leaderboard' }} />
        <Drawer.Screen name={`[user]/profile`} options={{ title: 'Profile' }} />
        <Drawer.Screen name="camera/index" options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="auth"options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="chatPage" options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name="index" options={{drawerItemStyle: { display: 'none' }, headerShown: false}} />
        <Drawer.Screen name={`[user]/Messagerie`} options={{title : `Conversation`}} />
        
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
