import {
  CHANGE_COLLAPSED,
  SWITCH_LANGUAGE,
  GET_SETTINGS,
  GET_ALL_FETCH_FAIL,
} from "../types";
import { defaultLanguage } from "../../../config";

const initialSettings = {
  locale: defaultLanguage,
  collapsed: false,
  settings: {},
};

const settings = (state = initialSettings, action) => {
  switch (action.type) {
    case SWITCH_LANGUAGE:
      return {
        ...state,
        locale: action.payload,
      };
    case CHANGE_COLLAPSED:
      return {
        ...state,
        collapsed: action.payload,
      };
    case GET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
      };
    case GET_ALL_FETCH_FAIL:
      return {
        ...state,
        errorFetch: action.payload,
      };
    default:
      return state;
  }
};

export default settings;
