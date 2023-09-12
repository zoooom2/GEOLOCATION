import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
// import GoogleMaps from '../../components/googleMap';
// import GeoMap from '../components/geoMap';
import '../App.css';
import LoginPage from '../page/LoginPage';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchProfile } from '../features/userFeature/userSlice';
import { setCenter } from '../features/geoFeatures/geoSlice';
import GoogleMap from '../components/googleMap';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppSelector((state) => state.user);
  // const { companyGeoFences } = useAppSelector((state) => state.geo);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchProfile())
      // .then(() => dispatch(fetchFences()))
      .then(() => {
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
      })
      .then(() => {
        const newSocket = io('https://maxfence.onrender.com');
        setSocket(newSocket);
        return () => {
          newSocket.disconnect();
        };
      });
  }, [dispatch]);

  useEffect(() => {
    let watchId: number | null;
    // console.log('movement');

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
  }, [socket, user]);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<GoogleMap />} />
        {/* <Route path='/' element={<GeoMap />} /> */}
        <Route path='/auth/' element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
