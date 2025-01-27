import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Alert, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { sendDatas, getIdFromJwt } from '../lib/axios';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function PedometerWithSensors() {
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState(0);
  const [userLocations, setUserLocations] = useState([]);
  const [lastAcceleration, setLastAcceleration] = useState(0);
  const [lastStepTime, setLastStepTime] = useState(Date.now());
  const locationSubscription = useRef(null); // Store location subscription
  const [id, setId] = useState(0);
  const isToggling = useRef(false); // Prevent multiple rapid toggles
  const width = useSharedValue(100);
  const height = useSharedValue(100);
  const buttonScale = useSharedValue(1);
  const buttonTranslateY = useSharedValue(0); // Initial position

  // Fetch user ID when the component is mounted
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getIdFromJwt();
        if (!userId) {
          console.log('No JWT available');
          return;
        }
        setId(userId);
      } catch (error) {
        console.log('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (steps % 100 === 0 && steps !== 0) {
      buttonTranslateY.value = withSpring(-50, {}, () => {
        buttonTranslateY.value = withSpring(0);
      });
      Vibration.vibrate(100);
    }
  }, [steps]);

  const handleStepDetection = (accelData) => {
    const acceleration = Math.sqrt(accelData.x ** 2 + accelData.y ** 2 + accelData.z ** 2);
    const currentTime = Date.now();
    if (acceleration > 1.2 && acceleration - lastAcceleration > 0.5) {
      if (currentTime - lastStepTime > 300) {
        setSteps((prev) => prev + 1); setLastStepTime(currentTime);
      }
    }
    setLastAcceleration(acceleration);
  };

  const startTracking = async () => {
    if (isToggling.current) return; // Prevent duplicate toggles
    isToggling.current = true;

    try {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Accelerometer is not available on this device.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied.');return;
      }

      Accelerometer.setUpdateInterval(100);
      Accelerometer.addListener(handleStepDetection);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // Use balanced accuracy
          timeInterval: 60000, // 1 minute
          distanceInterval: 0,
        },
        (location) => {
          if (location && location.coords) { setUserLocations((prev) => [...prev,
              { latitude: location.coords.latitude, longitude: location.coords.longitude },
            ]);
          }
        }
      );

      setIsTracking(true);
    } catch (error) {
    Alert.alert('Error', 'Failed to start tracking.');
    } finally {
      isToggling.current = false;
    }
  };

  const stopTracking = async () => {
    if (isToggling.current) return; // Prevent duplicate toggles
    isToggling.current = true;
    try {
      Accelerometer.removeAllListeners();
      if (locationSubscription.current) {
        locationSubscription.current.remove(); locationSubscription.current = null;
      }
      if (userLocations.length > 0) {
        await sendDatas(userLocations, id, steps);
        Alert.alert('Success', 'Data sent successfully.');
      } else {
        Alert.alert('Info', 'No location data to send.');
      }
      setSteps(0);
      setUserLocations([]);
      setLastAcceleration(0);
      setLastStepTime(Date.now());
      setIsTracking(false);
    } catch (error) {
      console.log('Error stopping tracking:', error);
      Alert.alert('Error', 'Failed to stop tracking.');
    } finally {
      isToggling.current = false;
    }
  };

  const toggleTracking = () => {
    buttonScale.value = withSpring(1.2, {}, () => {
      buttonScale.value = withSpring(1);
    });
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }, { translateY: buttonTranslateY.value }],
    };
  });

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl mb-5">Steps: {steps}</Text>
      <Animated.View className="bg-blue-300 mb-5" style={{ width }} />
      <Animated.View style={animatedButtonStyle}>
        <Button
          title={isTracking ? 'Stop Tracking' : 'Start Tracking'}
          onPress={toggleTracking}
          color={isTracking ? 'red' : 'green'}
        />
      </Animated.View>

      {userLocations.length > 0 ? (
        <MapView
          style={{ width: '100%', height: 300, marginTop: 20 }}
          initialRegion={{
            latitude: userLocations[0].latitude,
            longitude: userLocations[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={userLocations} strokeColor="blue" strokeWidth={3} />
          {userLocations.map((loc, index) => (
            <Marker key={index} coordinate={loc} />
          ))}
        </MapView>
      ) : (
        <Text className="mt-5 text-lg text-gray-500">Location data will appear here once tracking starts.</Text>
      )}
    </View>
  );
}
