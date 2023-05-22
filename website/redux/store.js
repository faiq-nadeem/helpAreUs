import thunk from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/index";
import { HYDRATE, createWrapper } from "next-redux-wrapper";

const bindMiddleware = (middleware) => {
   if (process.env.NODE_ENV == "development") {
      const { composeWithDevTools } = require("redux-devtools-extension");
      return composeWithDevTools(applyMiddleware(...middleware));
   }
   return applyMiddleware(...middleware);
};
const reducer = (state, action) => {
   if (action.type === HYDRATE) {
      const nextState = {
         ...state,
         ...action.payload,
      };

      return nextState;
   } else {
      return rootReducer(state, action);
   }
};

const initStore = () => {
   return createStore(reducer, bindMiddleware([thunk]));
};

export const wrapper = createWrapper(initStore);
