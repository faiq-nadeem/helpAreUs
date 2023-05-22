import { combineReducers } from "redux";
import Settings from "./Settings";
import Login from "./Login";

const reducers = combineReducers({
  settings: Settings,
  login: Login,
});

export default reducers;
