"use client";

import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/auth.slice";

export const Store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },
  devTools: false,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// call refreshToken on every page load
const initializeApp = async () => {
  await Store.dispatch(apiSlice.endpoints.refreshToken.initiate({}, { forceRefetch: true }));
  await Store.dispatch(apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true }));
};

initializeApp();
