import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import * as Cookies from 'es-cookie';
// import {  UserStateType, UserType } from '../../types';
import { FieldValues } from 'react-hook-form';
import { UserStateType, UserType } from '../../types';

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () => {
  const response = await axios.get(`http://localhost:2705/api/v1/users/me`);
  return response.data.data;
});

export const checkVisitorCount = createAsyncThunk(
  'user/checkVisitorCount',
  async () => {
    if (!Cookies.get('visited')) {
      Cookies.set('visited', 'true', { expires: 1 });
      const response = await axios.patch(
        `${import.meta.env.BASE_URL}/api/v1/visitor`
      );
      return response.data.doc.count;
    }
  }
);

export const logOut = createAsyncThunk('user/logOut', async () => {
  const response = await axios.get(
    `${import.meta.env.BASE_URL}/api/v1/users/logout`
  );
  return response.data.status;
});

console.log(import.meta.env.BASE_URL);

export const jwtAuth = createAsyncThunk(
  'user/jwtAuth',
  async ([email, password]: string[]) => {
    const response = await axios.post(
      `http://localhost:2705/api/v1/users/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
    return response.data.user;
  }
);

export const signup = createAsyncThunk(
  'user/signup',
  async (data: FieldValues) => {
    const response = await axios.post(
      `${import.meta.env.BASE_URL}/api/v1/users/signup`,
      data
    );
    return response.data.user;
  }
);

export const fetchFences = createAsyncThunk('user/fetchFences', async () => {
  const response = await axios.get(`http://localhost:2705/api/v1/location/`);
  console.log(response.data);
  return response.data;
});

const initialState = {
  loading: true,
  isAuthenticated: false,
  authentication_error: '',
  remove_auth_error: '',
  clicked: false,
  visitor_count: 0,
  fetch_user_error: '',
  visitor_count_error: '',
  fetch_fences_error: '',
  user: {
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    companyID: '',
    photo: '',
    role: '',
    currentLocation: '',
    locationHistory: [],
  },
  companyGeoFences: [],
  imageFile: {
    file: undefined,
    filePreview: undefined,
  },
} as UserStateType;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authenticateUser: (state, action: { type: string; payload: UserType }) => {
      state = {
        ...state,
        isAuthenticated: true,
        user: { ...action.payload },
        loading: false,
        authentication_error: '',
      };
    },

    removeAuthentication: (state) => {
      state.isAuthenticated = false;
      state.user = { ...initialState.user };
      state.loading = false;
    },

    handleImage: (state, action: { payload: File }) => {
      state.imageFile = {
        file: action.payload,
        filePreview: URL.createObjectURL(action.payload),
      };
    },
    stopLoading: (state) => {
      state.loading = false;
    },
    removeImage: (state) => {
      state.imageFile = { ...initialState.imageFile };
    },
    googleAuth: () => {
      window.open(`${import.meta.env.BASE_URL}/api/v1/auth/google/`, '_self');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.fetch_user_error = '';
    });
    builder.addCase(
      fetchProfile.fulfilled,
      (state, action: { payload: UserType }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = { ...action.payload };
      }
    );
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.fetch_user_error = action.error.message as string;
      state.loading = false;
    });

    builder.addCase(checkVisitorCount.pending, (state) => {
      state.loading = true;
      state.visitor_count_error = '';
    });
    builder.addCase(
      checkVisitorCount.fulfilled,
      (state, action: { payload: number }) => {
        state.visitor_count_error = '';
        state.visitor_count = action.payload;
      }
    );
    builder.addCase(checkVisitorCount.rejected, (state, action) => {
      state.visitor_count_error = action.error.message as string;
      // state.loading = false;
    });
    builder.addCase(logOut.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logOut.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = { ...initialState.user };
      state.remove_auth_error = '';
      state.loading = false;
    });
    builder.addCase(logOut.rejected, (state, action) => {
      state.loading = false;
      state.remove_auth_error = action.error.message as string;
    });
    builder.addCase(jwtAuth.pending, (state) => {
      state.loading = false;
      state.authentication_error = '';
    });
    builder.addCase(
      jwtAuth.fulfilled,
      (state, action: { payload: UserType }) => {
        state.isAuthenticated = true;

        state.user = { ...action.payload };
        state.loading = false;
        state.authentication_error = '';
      }
    );
    builder.addCase(jwtAuth.rejected, (state, action) => {
      state.loading = false;
      state.authentication_error = action.error.message as string;
    });
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.authentication_error = '';
      })
      .addCase(signup.fulfilled, (state, action: { payload: UserType }) => {
        state.isAuthenticated = true;
        state.user = { ...action.payload };
        state.loading = false;
        state.authentication_error = '';
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.authentication_error = action.error.message as string;
      });
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

export const {
  authenticateUser,
  removeAuthentication,
  handleImage,
  removeImage,
  googleAuth,
  stopLoading,
} = userSlice.actions;
export default userSlice.reducer;
