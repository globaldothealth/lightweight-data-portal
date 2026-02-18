import { configureStore, combineReducers } from '@reduxjs/toolkit';

import appReducer from './app/slice';
import dataDownloadsReducer from './dataDownloads/slice';



export const rootReducer = combineReducers({
    app: appReducer,
    dataDownloads: dataDownloadsReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
