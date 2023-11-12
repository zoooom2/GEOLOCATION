import { LoadScript } from '@react-google-maps/api';
import GMap from './googleMap';

const MainGMap = () => {
  return (
    <LoadScript googleMapsApiKey=''>
      <GMap />
    </LoadScript>
  );
};

export default MainGMap;
