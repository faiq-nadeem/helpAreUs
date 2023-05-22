import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

function configureStore(initialState = {}) {
  const store = createStore(reducers, initialState, applyMiddleware(thunk));

  return store;
}

export default configureStore;
