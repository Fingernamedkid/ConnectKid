import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useUserId } from '../../contexts/UserIdContext';
import { Text, View } from 'react-native';

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
                router.push('/');
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
