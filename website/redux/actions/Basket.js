import { BASKET_FETCH } from "../types";
import axios from "axios";
import { API_URL } from "../../../config";

export const updateBasket_r = (data) => {
   return {
      type: BASKET_FETCH,
      payload: data,
   };
};

export const getBasket_r = (id) => async (dispatch) => {
   if (id) {
      await axios.get(`${API_URL}/basket/customer/${id}`).then((res) => {
         dispatch({
            type: BASKET_FETCH,
            payload: res.data,
         });
      });
   }
};
