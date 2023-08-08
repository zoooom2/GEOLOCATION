import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import GoogleMaps from '../../components/googleMap';
import GeoMap from '../../components/geoMap';
import '../App.css';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    let watchId: number | null;
    if (socket) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          socket.emit('locationUpdate', { latitude, longitude });
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    }
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket]);

  return (
    <>
      <GeoMap />
      {/* <GoogleMaps /> 0*/}
    </>
  );
}

export default App;
