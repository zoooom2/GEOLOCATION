import { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  DrawingManagerF,
  Libraries,
  PolygonF as GoogleMapsPolygon,
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
    editable: true,
  };

  const centerCoord = useMemo(() => center, [center]);
  const polyArray = useRef(new Map());

  const onUnmount = useCallback(() => {
    polyArray.current.forEach((data) => {
      const { setAtListeners, removeAtListeners, insertAtListeners } = data;
      setAtListeners.remove();
      removeAtListeners.remove();
      insertAtListeners.remove();
    });
    polyArray.current.clear();
  }, [polyArray]);

  const onEdit = useCallback(
    (updatedPath: { lat: number; lng: number }[], index: string) => {
      // map them to an array of objects

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
      onUnmount();
    },
    [dispatch, onUnmount, polygons]
  );

  const onLoad = useCallback(() => {
    companyGeoFences.map(({ vertices: { coordinates }, uid, center }) => {
      const path = coordinates;
      const bufferDistance = 0.00008;
      const x = path.map(
        (arr) =>
          new google.maps.LatLng(
            arr[0] + bufferDistance,
            arr[1] - bufferDistance
          )
      );

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

  const handleDeletePolygon = (e) => {
    console.log(e);
  };

  const onPolygonLoad = (polygon: google.maps.Polygon, index: string) => {
    // store the reference with the index as the key
    polyArray.current.set(index, polygon);
    // get a reference to the polygon object
    const path = polygon.getPath();
    // add listeners for path change events
    const coords = path.getArray();

    const updatedPath = coords.map((coord) => ({
      lat: coord.lat(),
      lng: coord.lng(),
    }));
    const setAtListeners = path.addListener('set_at', () => {
      onEdit(updatedPath, index);
    });

    const insertAtListeners = path.addListener('insert_at', () => {
      onEdit(updatedPath, index);
    });

    const removeAtListeners = path.addListener('remove_at', () => {
      onEdit(updatedPath, index);
    });

    polyArray.current.set(index, {
      polygon,
      setAtListeners,
      insertAtListeners,
      removeAtListeners,
    });
  };

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
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
  }, []);

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
            onMouseUp={() => onEdit(vertices, uid)}
            // onClick={() => handleDeletePolygon(uid)
            options={polygonOptions}
            editable={editMode}
            onUnmount={onUnmount}
          />

          // put a button over the polygon which makes it deletable when deletemode is true
        );
      })}

      <DrawingManagerF
        options={{
          drawingControl: true,
          drawingControlOptions: {
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
        }}
        onPolygonComplete={handlePolygonComplete}
      />
    </GoogleMap>
  );
};

export default GMap;
