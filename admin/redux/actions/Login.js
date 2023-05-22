import { SET_LOGIN, SET_ISAUTHENTICATED, SET_LOGOUT } from "../types";

export const login_r = (data) => {
  return {
    type: SET_LOGIN,
    payload: data,
  };
};

export const logout_r = () => {
  return {
    type: SET_LOGOUT,
  };
};

export function isAuthenticated_r(isAuthenticated) {
  return {
    type: SET_ISAUTHENTICATED,
    payload: isAuthenticated,
  };
}
