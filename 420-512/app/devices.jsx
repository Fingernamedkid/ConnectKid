import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { fetchDevice, d} from '../lib/axios';
import { Alert } from 'react-native';
const Devices = () => {
    const [devices, setDevices] = useState([]);
    const router = useRouter();

    useFocusEffect(
        
        useCallback(() => {
            
            const loadDevices = async () => {
                const jwt = localStorage.getItem('jwt');
                if (!jwt) {
                    router.replace('/');
                    return;
                }
                try {
                    const response = await fetchDevice();
                    setDevices(response.data);
                    console.log('Devices:', response.data);
                } catch (error) {
                    console.error('Failed to fetch devices:', error);
                }
            };

            loadDevices();
        }, [])
    );

    const handleDelete = async (id) => {
        try {
            if(await deleteDevice(id);){

                Alert.alert('Device deleted successfully');
                setDevices(devices.filter(device => device.device_id !== id));
            }else{
                Alert.alert('Failed to delete device');
            }
        } catch (error) {
            Alert.alert('Failed to delete device');
            console.error('Failed to delete device:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Devices</Text>
            {devices? devices.map(device => (
                <View key={device._id} style={styles.deviceItem}>
                    <Text>{device.device_id}</Text>
                    <Button title="Delete" onPress={() => handleDelete(device.device_id)} />
                </View>
            )): <Text>No devices found</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%',
    },
});

export default Devices;