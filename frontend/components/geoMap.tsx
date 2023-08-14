import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
  Polygon,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import axios from 'axios';
import { useAppSelector } from '../src/App/hooks';

type EditLayer = {
  _leaflet_id: number;
  editing: { latlngs: Array<LatLng[]> };
};

const GeoMap = () => {
  const { companyGeoFences } = useAppSelector((user) => user.user);
  const [center, setCenter] = useState({ lat: 8, lng: 7 });
  const [mapLayers, setMapLayers] = useState<
    Array<{ id: number; latlngs: Array<LatLng> }>
  >([]);

  useEffect(() => {
    // Get user's geolocation and set it as the default center
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCenter({ lat, lng });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a default center in case geolocation fails
          setCenter({ lat: 51.505, lng: -0.09 });
        }
      );
    } else {
      console.error('Geolocation is not available in this browser');
      // Set a default center if geolocation is not available
      setCenter({ lat: 51.505, lng: -0.09 });
    }
  }, []);

  const getCenter = (arr: [[number, number]]) => {
    const center = arr.reduce(
      (acc, val) => [acc[0] + val[0], acc[1] + val[1]],
      [0, 0]
    );
    center[0] /= arr.length;
    center[1] /= arr.length;
    return center;
  };

  const _onCreated = async (e) => {
    const { layer, layerType } = e;

    if (layerType === 'polygon') {
      const { _leaflet_id } = layer;
      setMapLayers((layers) => [
        ...layers,
        { id: _leaflet_id, latlngs: layer._latlngs[0] },
      ]);
    }
    const vertices = layer._latlngs[0].map(
      (p: { lat: number; lng: number }) => [p.lat, p.lng]
    ) as [[number, number]];

    const center = getCenter(vertices);

    await axios.post('http://localhost:2705/api/v1/location/', {
      uid: layer._leaflet_id,
      polygon: {
        vertices: { type: 'Polygon', coordinates: vertices },
        center: { type: 'Point', coordinates: center },
      },
    });
  };
  const _onEdited = (e) => {
    const {
      layers: { _layers },
    } = e;

    Object.values<EditLayer>(_layers).map(({ _leaflet_id, editing }) => {
      setMapLayers((layers) =>
        layers.map((l) =>
          l.id === _leaflet_id
            ? { ...l, latlngs: { ...editing.latlngs[0] } }
            : l
        )
      );
    });

    // find the polygon by its uid and patch it

    // await axios.patch('http://localhost:2705/api/v1/location')
  };
  const _onDeleted = async (e) => {
    const {
      layers: { _layers },
    } = e;
    Object.values<{ _leaflet_id: number }>(_layers).map(({ _leaflet_id }) => {
      setMapLayers((layers) => layers.filter((l) => l.id !== _leaflet_id));
    });

    // find the polygon by its uid and delete it

    // await axios.delete()
  };
  // implement find address by search and also the ability to show the address of a place when it is clicked on the map
  // find a central point of all the polygons and make it the center of the map

  return (
    <>
      <MapContainer
        center={[center.lat, center.lng]}
        style={{ height: '100vh', width: '100vw', marginLeft: 0 }}
        zoom={13}
        scrollWheelZoom={false}>
        <FeatureGroup>
          <EditControl
            position='topright'
            onCreated={_onCreated}
            onEdited={_onEdited}
            onDeleted={_onDeleted}
            draw={{
              rectangle: false,
              polyline: false,
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
        <TileLayer
          attribution='maxFence'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <MarkerClusterGroup>
          {companyGeoFences.map((fence, index) => (
            <>
              <Polygon key={index} positions={fence.vertices.coordinates} />
              <Marker position={fence.center.coordinates} />
            </>
          ))}
          <Marker position={[center.lat, center.lng]}>
            <Popup>This is your location</Popup>
          </Marker>
        </MarkerClusterGroup>
      </MapContainer>
      <pre style={{ textAlign: 'left' }}>{JSON.stringify(mapLayers, 1, 2)}</pre>
    </>
  );
};

export default GeoMap;
