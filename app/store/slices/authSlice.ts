import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/models/user";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string, refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, refreshToken, logout } = authSlice.actions;
export default authSlice.reducer;
