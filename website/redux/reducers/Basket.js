import { BASKET_FETCH } from "../types";

const initialSettings = {
   basket: [
      {
         created_user: {
            name: "",
            id: "",
         },
         customer_id: "",
         products: [],
      },
   ],
};

const basket = (state = initialSettings, action) => {
   switch (action.type) {
   case BASKET_FETCH:
      return {
         ...state,
         basket: action.payload,
      };

   default:
      return state;
   }
};

export default basket;
