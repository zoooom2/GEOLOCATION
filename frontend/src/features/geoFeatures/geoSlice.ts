import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { LatLng } from 'leaflet';

export const createFence = createAsyncThunk(
  'geo/createFence',
  async ({
    layer,
    vertices,
    center,
  }: {
    center: [number, number];
    vertices: [[number, number]];
    layer: { _leaflet_id: number };
  }) => {
    const response = await axios.post(
      'http://localhost:2705/api/v1/location/',
      {
        uid: layer._leaflet_id,
        polygon: {
          vertices: { type: 'Polygon', coordinates: vertices },
          center: { type: 'Point', coordinates: center },
        },
      }
    );
    return response.data;
  }
);

export const fetchFences = createAsyncThunk('geo/fetchFences', async () => {
  const response = await axios.get(`http://localhost:2705/api/v1/location/`);
  console.log(response.data);
  return response.data;
});

export const updateFenceByUID = createAsyncThunk(
  'geo/updateFenceByUID',
  async ({
    uid,
    vertices,
    center,
  }: {
    uid: number;
    center: [number, number];
    vertices: [[number, number]];
  }) => {
    const response = await axios.patch(
      `http://localhost:2705/api/v1/location/${uid}`,
      {
        center,
        vertices,
      }
    );
    return response.data;
  }
);
export const deleteFenceByUID = createAsyncThunk(
  'geo/deleteFenceByUID',
  async ({ uid }: { uid: number }) => {
    const response = await axios.delete(
      `http://localhost:2705/api/v1/location/${uid}`
    );
    return response.data;
  }
);

export type GeoStateType = {
  loading: boolean;
  companyGeoFences: {
    uid: number;
    vertices: {
      type: 'Polygon';
      coordinates: LatLng[];
    };
    center: {
      type: 'Point';
      coordinates: LatLng;
    }[];
  }[];
  fetch_fences_error: string;
  center: LatLng;
  mapLayers: Array<{ id: number; latlngs: Array<LatLng> }>;
};

const initialState = {
  loading: false,
  companyGeoFences: [],
  fetch_fences_error: '',
  center: { lat: 8, lng: 7 } as LatLng,
  mapLayers: [],
} as GeoStateType;

const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    setMapLayers: (state, action) => {
      state.mapLayers = action.payload;
    },
    setCenter: (state, action) => {
      state.center = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFences.pending, (state) => {
        state.loading = true;
        state.fetch_fences_error = '';
      })
      .addCase(fetchFences.fulfilled, (state, action) => {
        state.loading = false;
        state.companyGeoFences = [...action.payload];
      })
      .addCase(fetchFences.rejected, (state, action) => {
        state.loading = false;
        state.companyGeoFences = [];
        state.fetch_fences_error = action.error.message as string;
      });
  },
});

export const { setMapLayers, setCenter } = geoSlice.actions;

export default geoSlice.reducer;
