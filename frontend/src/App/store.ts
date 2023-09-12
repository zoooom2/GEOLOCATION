import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userFeature/userSlice';
import geoReducer from '../features/geoFeatures/geoSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    geo: geoReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
