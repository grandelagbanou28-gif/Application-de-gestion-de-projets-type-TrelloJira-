import {createSlice} from "@reduxjs/toolkit";
function saveState(state) {
  try {
    localStorage.setItem("sprintboard_chat", JSON.stringify(state.messages));
  } catch {}
}
const saved = localStorage.getItem("sprintboard_chat");
const initialState = {
  messages: saved ? JSON.parse(saved) : [],
  onlineUsers: []
};
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    sendMessage: (state, action) => {
      state.messages.push(action.payload);
      saveState(state);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
      saveState(state);
    },
    clearChat: state => {
      state.messages = [];
      saveState(state);
    }
  }
});
export const {sendMessage, setOnlineUsers, deleteMessage, clearChat} = chatSlice.actions;
export default chatSlice.reducer;
