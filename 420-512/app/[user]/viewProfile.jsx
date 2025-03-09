import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useUserId } from '../../contexts/UserIdContext';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewProfile = () => {
    const router = useRouter();
    const { userId } = useUserId();

    useFocusEffect(
        useCallback(() => {
            console.log("The userId is ", userId);
            if (userId) {
                router.push(`/${userId}/profile`);
            } else {
                console.log('No user ID available');
                const clearAll = async () => {
                    try {
                        await AsyncStorage.clear();
                        console.log('AsyncStorage cleared');
                    } catch (e) {
                        console.error('Failed to clear AsyncStorage', e);
                    }
                };

                clearAll();
                router.push('/auth/signin');
            }
        }, [userId, router])
    );

    return (
        <View>
            <Text>Redirecting to your Profile view...</Text>
        </View>
    );
};

export default ViewProfile;
