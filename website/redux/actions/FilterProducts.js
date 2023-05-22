import { FILTER_PRODUCTS, FILTER_RESET } from "../types";

export const filterProducts_r = (data) => {
   return {
      type: FILTER_PRODUCTS,
      payload: data,
   };
};

export const filterReset_r = () => {
   return {
      type: FILTER_RESET,
   };
};
