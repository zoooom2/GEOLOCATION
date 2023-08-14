import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  polygons: [],
};

const geoSlice = createSlice({ name: 'geoSlice', initialState, reducers: {} });
