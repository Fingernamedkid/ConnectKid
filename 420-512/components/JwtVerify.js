import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkJwt = async () => {
        try {
          const jwt = await AsyncStorage.getItem('jwt');
          if (jwt) {
            setIsAuthenticated(true);
          } else {
            router.push('/auth'); 
          }
        } catch (error) {
          console.error('Error checking JWT:', error);
          router.push('/'); 
        } finally {
          setLoading(false);
        }
      };

      checkJwt();
    }, []);

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Redirecting to login...</Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;