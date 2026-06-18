import {configureStore} from '@reduxjs/toolkit';
import workspaceReducer from '../features/workspaceSlice';
import themeReducer from '../features/themeSlice';
import authReducer from '../features/authSlice';
import languageReducer from '../features/languageSlice';
import notificationsReducer from '../features/notificationsSlice';
import chatReducer from '../features/chatSlice';
export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    theme: themeReducer,
    auth: authReducer,
    language: languageReducer,
    notifications: notificationsReducer,
    chat: chatReducer
  }
});
