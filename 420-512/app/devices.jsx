import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { fetchDevice, getIdFromJwt, deleteDevice} from '../lib/axios';
import { Alert } from 'react-native';
import { Platform } from 'react-native';
const Devices = () => {
    const [devices, setDevices] = useState([]);
    const router = useRouter();

    useFocusEffect(

        useCallback(() => {
            
            const loadDevices = async () => {
                const id = await getIdFromJwt();
                console.log("getting devices")
                if(!id){
                    console.log("no jwt")
                    router.replace('/');
                    return null;}
                try {
                    const response = await fetchDevice();
                    if (response){
                        console.log("response", response.devices)
                        setDevices(response.devices);

                    }
                    
                } catch (error) {
                    console.log("error")
                    setDevices([]);
                    console.error('Failed to fetch devices:', error);
                    router.replace('/');
                }
            };

            loadDevices();
        }, [])
    );

    const handleDelete = async (id) => {
        try {
            console.log("deleting device", id)
            
            if(await deleteDevice(id)){

                if (Platform.OS === 'web') {
                    alert('Device deleted successfully');
                } else {
                    Alert.alert('Device deleted successfully');
                }
                setDevices(devices.filter(device => device.device_id !== id));
            }else{
                if (Platform.OS === 'web') {
                    alert('Device is not deleted');
                } else {
                    Alert.alert('Device not deleted');
                }
            }
        } catch (error) {
            if (Platform.OS === 'web') {
                alert('Error deleting device');
            } else {
                Alert.alert('Error deleting device');
            }
            console.error('Failed to delete device:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Devices</Text>
            {devices && devices.length > 0 ? (
                devices.map(device => (
                    <View key={device._id} style={styles.deviceItem}>
                        <Text>{device.device_id}</Text>
                        <Button title="Delete" onPress={() => handleDelete(device.device_id)} />
                    </View>
                ))
            ) : (
                <Text>No devices found</Text>
            )}
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