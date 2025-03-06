import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ClusterProps, MarkerClusterer } from 'react-native-maps';
import { GoogleMapsApiKey } from '../config';
import { fetchContactsLocation } from '../lib/axios';
import { useFocusEffect } from 'expo-router';

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
            console.log('Fetching contacts location...');
            fetchContactsLocation().then((contacts) => {

                setContacts(contacts);
                mapRef.current?.fitToCoordinates(contacts, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            });
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
                    {contacts.map((contact, index) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: Number(contact.latitude),
                                longitude: Number(contact.longitude),
                            }}
                        >
                            <Image
                                source={{ uri: "data:image/png;base64," + contact.image64 }}
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 50,
                                    borderColor: contact.velocity < 10 ? 'green' : 'red', 
                                    borderWidth: 2,
                                }}
                            />
                        </Marker>
                    ))}
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
