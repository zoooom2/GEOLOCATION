import {
  DrawingManager,
  DrawingManagerProps,
  GoogleMap,
  useJsApiLoader,
} from '@react-google-maps/api';
import { memo, useCallback, useState } from 'react';

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const MyComponent = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyD2zFtHVQKw1usC3lri7C-7tBX8Q9wYSz4',
    libraries: ['drawing', 'places'],
    language: 'en',
  });

  const [path, setPath] = useState([{ lat: 0, lng: 0 }]);
  const [map, setMap] = useState(null);
  const [drawingMode, setDrawingMode] = useState('polygon');
  const options = {
    drawingControl: true,
    drawingControlOptions: {
      drawingMode: 'polygon',
    },
    polygonOptions: {
      fillColor: '#2196F3',
      strokeColor: '#2196F3',
      fillOpacity: 0.5,
      strokeWeight: 2,
      clickable: true,
      editable: true,
      draggable: true,
      zindex: 1,
    },
  };

  const onLoad = useCallback((map) => {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback((map) => {
    setMap(null);
  }, []);

  const onPolygonComplete = useCallback((poly) => {
    const polyArray = poly.getPath().getArray();
    const paths: Array<{ lat: number; lng: number }> = [];
    polyArray.forEach((path: { lat: () => number; lng: () => number }) =>
      paths.push({ lat: path.lat(), lng: path.lng() })
    );
    setPath(paths);
    // point(path)
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}>
      {/* Child components, such as markers, info windows, etc. */}

      <DrawingManager
        drawingMode={drawingMode as google.maps.drawing.OverlayType}
        options={options as DrawingManagerProps}
        onPolygonComplete={onPolygonComplete}
        // editable
        // draggable
      />
    </GoogleMap>
  ) : (
    <></>
  );
};

export default memo(MyComponent);
