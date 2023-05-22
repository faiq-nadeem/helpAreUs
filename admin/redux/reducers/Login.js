import { SET_ISAUTHENTICATED, SET_LOGIN, SET_LOGOUT } from "../types";

const INIT_STATE = {
  user: {
    role: {
      blabla: false,
    },
  },
  isAuthenticated: false,
};

const States = (state = INIT_STATE, action) => {
  switch (action.type) {
    case SET_ISAUTHENTICATED: {
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    }
    case SET_LOGIN: {
      return {
        ...state,
        user: action.payload,
      };
    }
    case SET_LOGOUT: {
      return {
        ...state,
        user: { role: { view: "try" } },
        isAuthenticated: false,
      };
    }
    default:
      return state;
  }
};
export default States;
