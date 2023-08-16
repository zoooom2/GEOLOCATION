import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
  Polygon,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect } from 'react';
import { LatLng } from 'leaflet';

import { useAppDispatch, useAppSelector } from '../src/App/hooks';
import {
  createFence,
  deleteFenceByUID,
  setCenter,
  setMapLayers,
  updateFenceByUID,
} from '../src/features/geoFeatures/geoSlice';

type EditLayer = {
  _leaflet_id: number;
  editing: { latlngs: Array<LatLng[]> };
};

const GeoMap = () => {
  const { companyGeoFences } = useAppSelector((state) => state.user);
  const { center, mapLayers } = useAppSelector((state) => state.geo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    //load the map layers
    const loadedLayers = companyGeoFences.map((layer) => ({
      id: layer.uid,
      latlngs: layer.vertices.coordinates,
    }));
    dispatch(setMapLayers(loadedLayers));

    // Get user's geolocation and set it as the default center
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          dispatch(setCenter({ lat, lng }));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a default center in case geolocation fails
          dispatch(setCenter({ lat: 51.505, lng: -0.09 }));
        }
      );
    } else {
      console.error('Geolocation is not available in this browser');
      // Set a default center if geolocation is not available
      dispatch(setCenter({ lat: 51.505, lng: -0.09 }));
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
      dispatch(
        setMapLayers((layers: { id: number; latlngs: Array<LatLng> }[]) => [
          ...layers,
          { id: _leaflet_id, latlngs: layer._latlngs[0] },
        ])
      );
    }
    const vertices = layer._latlngs[0].map(
      (p: { lat: number; lng: number }) => [p.lat, p.lng]
    ) as [[number, number]];

    const center = getCenter(vertices);

    //add fence to database
    dispatch(createFence({ layer, vertices, center }));
  };

  const _onEdited = (e) => {
    const {
      layers: { _layers },
    } = e;

    Object.values<EditLayer>(_layers).map(({ _leaflet_id, editing }) => {
      dispatch(
        setMapLayers((layers: { id: number; latlngs: Array<LatLng> }[]) =>
          layers.map((l) => {
            if (l.id === _leaflet_id) {
              return { ...l, latlngs: { ...editing.latlngs[0] } };
            } else {
              return l;
            }
          })
        )
      );

      // update the database in the database
      const vertices = editing.latlngs[0].map(
        (p: { lat: number; lng: number }) => [p.lat, p.lng]
      ) as [[number, number]];
      const center = getCenter(vertices);

      dispatch(updateFenceByUID({ uid: _leaflet_id, vertices, center }));
    });
  };

  const _onDeleted = async (e) => {
    const {
      layers: { _layers },
    } = e;
    Object.values<{ _leaflet_id: number }>(_layers).map(({ _leaflet_id }) => {
      dispatch(
        setMapLayers((layers: { id: number; latlngs: Array<LatLng> }[]) =>
          layers.filter((l) => l.id !== _leaflet_id)
        )
      );

      //delete the fence from the database
      dispatch(deleteFenceByUID({ uid: _leaflet_id }));
    });
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
              polygon: true,
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
        <MarkerClusterGroup chunkedLoading>
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
