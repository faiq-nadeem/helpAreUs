import { combineReducers } from "redux";
import Settings from "./Settings";
import Login from "./Login";
import Brands from "./Brands";
import FilterProducts from "./FilterProducts";
import Categories from "./Categories";
import Basket from "./Basket";
import Topmenu from "./Topmenu";

const reducers = combineReducers({
   settings: Settings,
   login: Login,
   brands: Brands,
   filterProducts: FilterProducts,
   categories: Categories,
   basket: Basket,
   topmenu: Topmenu,
});

export default reducers;
