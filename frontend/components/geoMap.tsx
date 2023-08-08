import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useState, useRef, useEffect } from 'react';
import { LatLng, LayerEvent, LayersControlEvent, LeafletEvent } from 'leaflet';

type EditLayer = {
  _leaflet_id: number;
  editing: { latlngs: Array<LatLng[]> };
};

const GeoMap = () => {
  const [center, setCenter] = useState({ lat: 8, lng: 7 });
  const [mapLayers, setMapLayers] = useState<
    Array<{ id: number; latlngs: Array<LatLng> }>
  >([]);
  const mapRef = useRef();

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

  const _onCreated = (e) => {
    const { layer, layerType } = e;
    if (layerType === 'polygon') {
      const { _leaflet_id } = layer;
      setMapLayers((layers) => [
        ...layers,
        { id: _leaflet_id, latlngs: layer._latlngs[0] },
      ]);
    }
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
  };
  const _onDeleted = (e) => {
    const {
      layers: { _layers },
    } = e;
    Object.values<{ _leaflet_id: number }>(_layers).map(({ _leaflet_id }) => {
      setMapLayers((layers) => layers.filter((l) => l.id !== _leaflet_id));
    });
  };

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
        <Marker position={[center.lat, center.lng]}>
          <Popup>This is your location</Popup>
        </Marker>
      </MapContainer>
      <pre style={{ textAlign: 'left' }}>{JSON.stringify(mapLayers, 1, 2)}</pre>
    </>
  );
};

export default GeoMap;
