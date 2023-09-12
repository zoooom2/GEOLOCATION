// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   FeatureGroup,
//   Polygon,
// } from 'react-leaflet';
// import { EditControl } from 'react-leaflet-draw';
// import MarkerClusterGroup from 'react-leaflet-cluster';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-draw/dist/leaflet.draw.css';
// import { Fragment, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../App/hooks';
// import {
//   createFence,
//   deleteFenceByUID,
//   setCenter,
//   setMapLayers,
//   updateFenceByUID,
// } from '../features/geoFeatures/geoSlice';
// import { getPolygonCenter } from '../utils/helpers';

// type EditLayer = {
//   _leaflet_id: number;
//   editing: { latlngs: Array<{ lat: number; lng: number }[][]> };
// };

// const GeoMap = () => {
//   const { companyGeoFences } = useAppSelector((state) => state.geo);
//   const { center, mapLayers } = useAppSelector((state) => state.geo);
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     //load the map layers
//     const loadedLayers = companyGeoFences.map((layer) => ({
//       id: layer.uid,
//       latlngs: layer.vertices.coordinates.map((v) => ({
//         lat: v[0],
//         lng: v[1],
//       })),
//     }));

//     dispatch(setMapLayers(loadedLayers));

//     // Get user's geolocation and set it as the default center
//     if ('geolocation' in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude;
//           const lng = position.coords.longitude;
//           dispatch(setCenter({ lat, lng }));
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           // Set a default center in case geolocation fails
//           dispatch(setCenter({ lat: 51.505, lng: -0.09 }));
//         }
//       );
//     } else {
//       console.error('Geolocation is not available in this browser');
//       // Set a default center if geolocation is not available
//       dispatch(setCenter({ lat: 51.505, lng: -0.09 }));
//     }
//   }, [companyGeoFences, dispatch]);

//   const _onCreated = async (e) => {
//     const { layer, layerType } = e;
//     type mapLayer = {
//       _leaflet_id: number;
//       _latlngs: [{ lat: number; lng: number }[]];
//     };
//     if (layerType === 'polygon') {
//       const { _leaflet_id, _latlngs } = layer as mapLayer;
//       const coords = _latlngs[0].map((a) => ({ lat: a.lat, lng: a.lng }));
//       dispatch(setMapLayers([{ id: _leaflet_id, latlngs: coords }]));
//       const vertices = coords.map((p: { lat: number; lng: number }) => [
//         p.lat,
//         p.lng,
//       ]) as [[number, number]];

//       const center = getPolygonCenter(_latlngs[0]);

//       //add fence to database
//       dispatch(createFence({ vertices, center }));
//     }
//   };

//   const _onEdited = (e) => {
//     const {
//       layers: { _layers },
//     } = e;
//     console.log(typeof _layers);
//     Object.values<EditLayer>(_layers).map(({ _leaflet_id, editing }) => {
//       const coords = editing.latlngs[0][0].map((a) => ({
//         lat: a.lat,
//         lng: a.lng,
//       }));
//       console.log(coords);
//       dispatch(
//         setMapLayers(
//           mapLayers.map((l) => {
//             if (l.id === _leaflet_id) {
//               return { ...l, latlngs: coords };
//             } else {
//               return l;
//             }
//           })
//         )
//       );

//       // update the database in the database
//       const vertices = editing.latlngs[0][0].map(
//         (p: { lat: number; lng: number }) => [p.lat, p.lng]
//       ) as [[number, number]];
//       const center = getCenter(editing.latlngs[0][0]);

//       dispatch(updateFenceByUID({ uid: _leaflet_id, vertices, center }));
//     });
//   };

//   const _onDeleted = async (e) => {
//     const {
//       layers: { _layers },
//     } = e;
//     Object.values<{ _leaflet_id: number }>(_layers).map(({ _leaflet_id }) => {
//       dispatch(setMapLayers(mapLayers.filter((l) => l.id !== _leaflet_id)));

//       //delete the fence from the database
//       dispatch(deleteFenceByUID({ uid: _leaflet_id }));
//     });
//   };

//   // implement find address by search and also the ability to show the address of a place when it is clicked on the map
//   // find a central point of all the polygons and make it the center of the map
//   return (
//     <>
//       <MapContainer
//         center={[center.lat, center.lng]}
//         style={{ height: '100vh', width: '100vw', marginLeft: 0 }}
//         zoom={13}
//         scrollWheelZoom={false}>
//         <TileLayer
//           attribution='maxFence'
//           url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//         />
//         <FeatureGroup>
//           <MarkerClusterGroup chunkedLoading>
//             {companyGeoFences.map((fence, index) => {
//               return (
//                 <Fragment key={index}>
//                   <Polygon positions={fence.vertices.coordinates} />
//                   <Marker position={fence.center.coordinates} />
//                 </Fragment>
//               );
//             })}
//             <Marker position={[center.lat, center.lng]}>
//               <Popup>This is your location</Popup>
//             </Marker>
//           </MarkerClusterGroup>
//         </FeatureGroup>
//       </MapContainer>
//       <pre style={{ textAlign: 'left' }}>{JSON.stringify(mapLayers, 1, 2)}</pre>
//     </>
//   );
// };

// export default GeoMap;
