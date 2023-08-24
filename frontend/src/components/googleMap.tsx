import { useCallback, useMemo, useEffect, useRef, createRef } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  DrawingManagerF,
  Libraries,
  Polygon as GoogleMapsPolygon,
} from '@react-google-maps/api';
import { useAppDispatch, useAppSelector } from '../App/hooks';
import {
  createFence,
  updatePolygons,
  loadPolygons,
} from '../features/geoFeatures/geoSlice';
import { getPolygonCenter } from '../utils/helpers';

const GMap = () => {
  const { center, companyGeoFences, polygons, editMode } = useAppSelector(
    (state) => state.geo
  );
  const dispatch = useAppDispatch();

  const libraries = useMemo(() => ['drawing'], []) as Libraries;
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: '',
    libraries,
  });

  const polygonOptions = {
    strokeColor: 'yellow',
    strokeOpacity: 0.5,
    strokeWeight: 3.0,
    fillColor: 'red',
    fillOpacity: 0.2,
  };

  const centerCoord = useMemo(() => center, [center]);

  const onLoad = useCallback(() => {
    companyGeoFences.map(({ vertices: { coordinates }, uid, center }) => {
      const path = coordinates;

      const x = path.map((arr) => new google.maps.LatLng(arr[0], arr[1]));

      const coord = [...x];
      const areaCenter = new google.maps.LatLng(
        center.coordinates[0],
        center.coordinates[1]
      );
      const polyVertices: { lat: number; lng: number }[] = [];
      coord.forEach((obj) => {
        return polyVertices.push({ lat: obj.lat(), lng: obj.lng() });
      });

      dispatch(
        loadPolygons({
          vertices: polyVertices,
          center: { lat: areaCenter.lat(), lng: areaCenter.lng() },
          uid,
        })
      );
    });
  }, [companyGeoFences]);

  useEffect(() => onLoad, [onLoad]);

  useEffect(() => {
    console.log(polygons);
  }, [polygons]);

  const handleDeletePolygon = (e) => {
    console.log(e);
  };

  const polyArray = new Map();

  const onPolygonLoad = (polygon: google.maps.Polygon, index: string) => {
    // store the reference with the index as the key
    polyArray.set(index, polygon);
    // get a reference to the polygon object
    const path = polygon.getPath();
    // add listeners for path change events
    path.addListener('set_at', () => {
      // get the array of coordinates
      const coords = path.getArray();
      // map them to an array of objects
      const updatedPath = coords.map((coord) => ({
        lat: coord.lat(),
        lng: coord.lng(),
      }));
      // do something with the updated path
      console.log('updated path', updatedPath);
      const updatedPolygon = polygons.map(({ uid, vertices, center }) => {
        if (uid === index) {
          const updatedCenter = getPolygonCenter(updatedPath);
          return { uid, vertices: updatedPath, center: updatedCenter };
        } else {
          return { uid, vertices, center };
        }
      });
      dispatch(updatePolygons(updatedPolygon));
    });

    path.addListener('insert_at', () => {
      // do something when a point is added
      console.log('insert_at', index);
      const coords = path.getArray();
      // map them to an array of objects
      const updatedPath = coords.map((coord) => ({
        lat: coord.lat(),
        lng: coord.lng(),
      }));
      // do something with the updated path
      // console.log('updated path', updatedPath);
      const updatedPolygon = polygons.map(({ uid, vertices, center }) => {
        if (uid === index) {
          const updatedCenter = getPolygonCenter(updatedPath);
          return { uid, vertices: updatedPath, center: updatedCenter };
        } else {
          return { uid, vertices, center };
        }
      });
      dispatch(updatePolygons(updatedPolygon));
    });
  };

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    //figure out how to get the coordinates of the polygon
    const polyArray = polygon.getPath().getArray();
    const path: { lat: number; lng: number }[] = [];
    const coord: Array<[number, number]> = [];
    polyArray.forEach((poly) => {
      path.push({ lat: poly.lat(), lng: poly.lng() });
      coord.push([poly.lat(), poly.lng()]);
    });
    const center = getPolygonCenter(path);
    // console.log(polyArray);

    dispatch(createFence({ center, vertices: coord }));
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      zoom={17}
      center={centerCoord}
      mapContainerClassName='map-container'
      mapContainerStyle={{ width: '100vw', height: '100vh' }}
      onLoad={onLoad}>
      <MarkerF position={centerCoord} />
      {polygons.map(({ vertices, center, uid }, i) => {
        // const polygonRef = createRef<GoogleMapsPolygon>();
        return (
          <GoogleMapsPolygon
            onLoad={(polygon) => onPolygonLoad(polygon, uid)}
            key={uid}
            paths={vertices}
            // onMouseUp={() => handlePathChange(i)}
            // onClick={() => handleDeletePolygon(uid)}
            options={polygonOptions}
            editable={editMode}
          />

          // put a button over the polygon which makes it deletable when deletemode is true
        );
      })}
      {/* {mapLayers.map(({ latlngs }, index) => {
        return <Polyline key={index} path={latlngs} />;
      })} */}
      <DrawingManagerF onPolygonComplete={handlePolygonComplete} />
    </GoogleMap>
  );
};

export default GMap;
