import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ClusterProps, MarkerClusterer } from 'react-native-maps';
import { GoogleMapsApiKey } from '../config';

//I would like a moment to thanks our sponsor: https://github.com/teovillanueva/react-native-web-maps/tree/main/example
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
  const mapRef = useRef(null);

  const googleMapsApiKey = GoogleMapsApiKey;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider="google"
        style={{ flex: 1 }}
        onRegionChange={setRegion}
        googleMapsApiKey={googleMapsApiKey}
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
          <Marker

            coordinate={{
                latitude: 59.33956246905637,
                longitude: 18.050015441134114,
            }}
            >

                <Image source={{ uri: 'https://i.redd.it/gcquq5dw2bcc1.jpeg' }} style={{height: 40, width:40, borderRadius: 50, borderColor: "red", borderWidth:2}} />
          
            </Marker>
          <Marker
            coordinate={{
              latitude: 59.3442016958775,
              longitude: 18.038256636812825,
            }}
          >
        <Image source={{ uri: 'https://i1.sndcdn.com/artworks-zYoxHRFRbsYeWKGg-pugd9A-t500x500.jpg' }} style={{height: 40, width:40, borderRadius: 50, borderColor: "red", borderWidth:2}} />
            </Marker>

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
