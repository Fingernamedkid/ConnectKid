// OverlayMessage.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { colorsPalette } from '../assets/colorsPalette';
const OverlayMessage = ({ message, visible, onDismiss, styles }) => {
  const {theme} = useTheme()
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount or visibility change
    }
  }, [visible]);

  if (!visible) return null; // Don't render if not visible

  return (
    <View className="absolute bottom-10 h-auto w-full justify-center items-center">
      <View className="w-3/4 my-10 border-2 py-20 rounded-lg p-5" style={styles}>
        <Text className=" text-center text-lg text-black">{message}</Text>
      </View>
    </View>
  );
};

export default OverlayMessage;
