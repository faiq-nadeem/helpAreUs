import { CATEGORIES_FETCH } from "../types";

const initialSettings = {
   categories: [],
};

const categories = (state = initialSettings, action) => {
   switch (action.type) {
   case CATEGORIES_FETCH:
      return {
         ...state,
         categories: action.payload,
      };

   default:
      return state;
   }
};

export default categories;
