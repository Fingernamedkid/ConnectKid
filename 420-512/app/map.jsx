import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ClusterProps, MarkerClusterer } from 'react-native-maps';
import { GoogleMapsApiKey } from '../config';
import { fetchContactsLocation } from '../lib/axios';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function MyClusterComponent(props) {
    return (
        <Marker
            onPress={props.onPress}
            coordinate={props.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
        >
            <View style={styles.cluster}>
                <Text style={styles.clusterText}>{props.pointCountAbbreviated}</Text>
            </View>
        </Marker>
    );
}

export default function Map() {
    const [region, setRegion] = useState(null);
    const [contacts, setContacts] = useState([]);
    const mapRef = useRef(null);

    const googleMapsApiKey = GoogleMapsApiKey;
    useFocusEffect(
        useCallback(() => {
            const fetchContacts = async () => {
                try {
                    console.log('Fetching contacts location...');
                    const contacts = await fetchContactsLocation();
                    setContacts(contacts);
                    const formattedContacts = contacts.map(contact => ({
                        latitude: Number(contact.latitude),
                        longitude: Number(contact.longitude),
                    }));
                    mapRef.current?.fitToCoordinates(formattedContacts, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true,
                    });
                } catch (error) {
                    const router = useRouter();

                    await AsyncStorage.clear();
                    router.push('/');

                }
            };

            fetchContacts();
            const intervalId = setInterval(fetchContacts, 10000);

            return () => clearInterval(intervalId);
        }, [])
    );

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider="google"
                style={{ flex: 1 }}
                onRegionChange={setRegion}
                googleMapsApiKey={googleMapsApiKey}
                initialRegion={{
                    latitude: 39.8283, 
                    longitude: -98.5795, 
                    latitudeDelta: 40,
                    longitudeDelta: 40,
                }}
            >
                <MarkerClusterer
                    onClusterPress={(cluster) => {
                        mapRef.current?.animateCamera({
                            center: cluster.coordinate,
                            zoom: cluster.expansionZoom + 3,
                        });
                    }}
                    region={region}
                    renderCluster={(cluster) => (
                        <MyClusterComponent
                            {...cluster}
                            onPress={() =>
                                mapRef.current?.animateCamera({
                                    center: cluster.coordinate,
                                    zoom: cluster.expansionZoom + 3,
                                })
                            }
                        />
                    )}
                >
                    {contacts.map((contact, index) => {
                        console.log(contact);
                        return (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: Number(contact.latitude),
                                    longitude: Number(contact.longitude),
                                }}
                            >
                                <Image
                                    source={{ uri: "data:image/jpeg;base64,"+contact.image64 }}
                                    style={{
                                        height: 40,
                                        width: 40,
                                        borderRadius: 50,
                                        borderColor: contact.velocity < 10 ? 'green' : 'red', 
                                        borderWidth: 2,
                                    }}
                                />
                            </Marker>
                        );
                    })}
                </MarkerClusterer>
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cluster: {
        backgroundColor: 'salmon',
        width: 20,
        height: 20,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clusterText: {
        fontWeight: '700',
    },
});
