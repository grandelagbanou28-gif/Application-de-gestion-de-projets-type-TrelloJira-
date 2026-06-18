import {createSlice} from "@reduxjs/toolkit";
function saveState(state) {
  try {
    localStorage.setItem("sprintboard_notifications", JSON.stringify(state.items));
  } catch {}
}
const saved = localStorage.getItem("sprintboard_notifications");
const initialState = {
  items: saved ? JSON.parse(saved) : []
};
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      saveState(state);
    },
    markRead: (state, action) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item) item.read = true;
      saveState(state);
    },
    markAllRead: state => {
      state.items.forEach(n => {
        n.read = true;
      });
      saveState(state);
    },
    clearNotifications: state => {
      state.items = [];
      saveState(state);
    },
    deleteNotification: (state, action) => {
      state.items = state.items.filter(n => n.id !== action.payload);
      saveState(state);
    }
  }
});
export const {addNotification, markRead, markAllRead, clearNotifications, deleteNotification} = notificationsSlice.actions;
export default notificationsSlice.reducer;
