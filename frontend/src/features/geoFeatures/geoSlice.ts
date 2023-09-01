import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// import { LatLng } from 'leaflet';
import { GeoStateType } from '../../types';

export const createFence = createAsyncThunk(
  'geo/createFence',
  async ({
    vertices,
    center,
  }: {
    center: [number, number];
    vertices: Array<[number, number]>;
  }) => {
    const response = await axios.post(
      'http://localhost:2705/api/v1/location/',
      {
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

  return response.data;
});

export const updateFenceByUID = createAsyncThunk(
  'geo/updateFenceByUID',
  async ({
    uid,
    vertices,
    center,
  }: {
    uid: string;
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
  async ({ uid }: { uid: string }) => {
    const response = await axios.delete(
      `http://localhost:2705/api/v1/location/${uid}`
    );
    return response.data;
  }
);

const initialState = {
  loading: false,
  companyGeoFences: [],
  fetch_fences_error: '',
  center: { lat: 8, lng: 7 },
  mapLayers: [],
  polygons: [],
  mode: 'normal',
} as GeoStateType;

const geoSlice = createSlice({
  name: 'geoSlice',
  initialState,
  reducers: {
    setMapLayers: (
      state,
      action: {
        payload: { id: number; latlngs: Array<{ lat: number; lng: number }> }[];
      }
    ) => {
      state.mapLayers = [...state.mapLayers, ...action.payload];
    },
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    loadPolygons: (state, action) => {
      // console.log(action.payload);
      state.polygons = [...state.polygons, action.payload];
    },
    updatePolygons: (state, action) => {
      state.polygons = [...action.payload];
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

export const { setMapLayers, setCenter, updatePolygons, loadPolygons } =
  geoSlice.actions;

export default geoSlice.reducer;
