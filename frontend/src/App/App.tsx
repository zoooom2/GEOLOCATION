import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
// import GoogleMaps from '../../components/googleMap';
import GeoMap from '../../components/geoMap';
import '../App.css';
import LoginPage from '../page/LoginPage';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchProfile } from '../features/userFeature/userSlice';
import { fetchFences } from '../features/geoFeatures/geoSlice';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    user: { user },
  } = useAppSelector((user) => user);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile())
      .then(() => {
        dispatch(fetchFences());
      })
      .then(() => {
        const newSocket = io('http://localhost:2705/');
        setSocket(newSocket);
        return () => {
          newSocket.disconnect();
        };
      });
  }, []);

  useEffect(() => {
    let watchId: number | null;
    console.log('movement');

    if (socket && user.companyID) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          socket.emit('locationUpdate', {
            latitude,
            longitude,
            user,
          });
        },
        (error) => {
          console.error('Error getting location', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0,
        }
      );
    }
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, user.companyID, user._id]);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<GeoMap />} />
        <Route path='/auth' element={<LoginPage />} />
      </Routes>

      {/* <GoogleMaps /> 0*/}
    </Router>
  );
}

export default App;
