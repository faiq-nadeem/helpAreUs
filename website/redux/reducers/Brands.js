import { BRANDS_FETCH } from "../types";

const initialSettings = {
   brands: [],
};

const brands = (state = initialSettings, action) => {
   switch (action.type) {
   case BRANDS_FETCH:
      return {
         ...state,
         brands: action.payload,
      };

   default:
      return state;
   }
};

export default brands;
