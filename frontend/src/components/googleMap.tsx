import { useCallback, useMemo, useEffect, useRef, Fragment } from 'react';
import {
  GoogleMap,
  // useLoadScript,
  MarkerF,
  DrawingManagerF,
  // Libraries,
  PolygonF as GoogleMapsPolygon,
  // MarkerClustererF,
} from '@react-google-maps/api';
import { useAppDispatch, useAppSelector } from '../App/hooks';
import {
  createFence,
  updatePolygons,
  deleteFenceByUID,
  fetchFences,
} from '../features/geoFeatures/geoSlice';
import { getPolygonCenter } from '../utils/helpers';
// import { libraries } from '../utils/constants';

const GMap = () => {
  const {
    center,
    companyGeoFences,
    polygons,
    mode = 'normal',
  } = useAppSelector((state) => state.geo);
  const dispatch = useAppDispatch();

  // const libraries = useMemo(() => ['drawing'], []) as Libraries;
  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: '',
  //   libraries: libraries,
  // });

  const polygonOptions = {
    strokeColor: 'yellow',
    strokeOpacity: 0.5,
    strokeWeight: 3.0,
    fillColor: 'red',
    fillOpacity: 0.2,
    editable: true,
  };

  console.log('render');

  const centerCoord = useMemo(() => center, [center]);
  const polyArray = useRef(new Map());

  // useEffect(() => {
  //   if (companyGeoFences.length < 1) dispatch(fetchFences());
  // }, []);

  // const onUnmount = useCallback(() => {
  //   polyArray.current.forEach((data) => {
  //     const { setAtListeners, removeAtListeners, insertAtListeners } = data;
  //     setAtListeners.remove();
  //     removeAtListeners.remove();
  //     insertAtListeners.remove();
  //   });
  //   polyArray.current.clear();
  // }, [polyArray]);

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
    },
    [polygons]
  );

  const onLoad = useCallback(async () => {
    console.log('onLoad');
    await dispatch(fetchFences());

    const polygonArray: {
      vertices: { lat: number; lng: number }[];
      center: { lat: number; lng: number };
      uid: string;
    }[] = [];
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

      polygonArray.push({
        vertices: polyVertices,
        center: { lat: areaCenter.lat(), lng: areaCenter.lng() },
        uid,
      });
    });

    dispatch(updatePolygons(polygonArray));
  }, [companyGeoFences, dispatch]);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const handleDeletePolygon = useCallback(async (uid: string) => {
    console.log('deletes');
    if (mode === 'delete') {
      const response = await dispatch(deleteFenceByUID({ uid }));
      if (response.type.endsWith('fulfilled')) {
        // dispatch(updatePolygons([]));
        dispatch(updatePolygons(polygons.filter((p) => p.uid !== uid)));
      }
    }
  }, []);

  const onPolygonLoad = useCallback(
    (polygon: google.maps.Polygon, index: string) => {
      // console.log('polygon loaded');
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
    },
    [onEdit]
  );

  const handlePolygonComplete = useCallback(
    async (polygon: google.maps.Polygon) => {
      //figure out how to get the coordinates of the polygon
      const polygonArray = polygon.getPath().getArray();
      const path: { lat: number; lng: number }[] = [];
      const coord: Array<[number, number]> = [];

      //set condition to make sure the polygon has at least 3 points
      if (polygonArray.length >= 3) {
        polygonArray.forEach((poly) => {
          path.push({ lat: poly.lat(), lng: poly.lng() });
          coord.push([poly.lat(), poly.lng()]);
        });
        const center = getPolygonCenter(path);

        //remove overlay after creating
        polygon.setMap(null);
        const result = await dispatch(createFence({ center, vertices: coord }));
        if (result.type.endsWith('fulfilled')) {
          dispatch(
            updatePolygons([
              ...polygons,
              {
                center: { lat: center[0], lng: center[1] },
                vertices: path,
                uid: result.payload._id,
              },
            ])
          );
        } else {
          console.log('couldnt create polygon');
        }
      } else {
        console.log('check coordinates length');
      }
    },
    []
  );

  // if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      onLoad={onLoad}
      zoom={17}
      center={centerCoord}
      mapContainerClassName='map-container'
      options={{ gestureHandling: 'greedy' }}
      mapContainerStyle={{ width: '100vw', height: '70vh' }}>
      <MarkerF position={centerCoord} />
      {polygons.map(({ vertices, uid }, i) => {
        return (
          <Fragment key={i}>
            <GoogleMapsPolygon
              onLoad={(polygon) => onPolygonLoad(polygon, uid)}
              paths={vertices}
              onClick={() => handleDeletePolygon(uid)}
              options={polygonOptions}
              editable={false}
              // onUnmount={console.log}
            />
          </Fragment>
          //put a marker in the center of the polygon and cluster them
          // put a button over the polygon which makes it deletable when deletemode is true
        );
      })}

      {/* <MarkerClustererF>
        {(clusterer) => (
          <div>
            {polygons.map(({ center }, i) => {
              return (
                <MarkerF
                  key={i}
                  position={new google.maps.LatLng(center.lat, center.lng)}
                  clusterer={clusterer}
                />
              );
            })}
          </div>
        )}
      </MarkerClustererF> */}

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
