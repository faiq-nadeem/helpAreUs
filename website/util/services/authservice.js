import { API_URL } from "../../../config";
import axios from "axios";
export default {
   login: (user) => {
      return axios
         .post(`${API_URL}/users/loginuser`, user)
         .then((res) => {
            return res.data;
         })
         .catch(() => {
            return {
               isAuthenticated: false,
               user: {
                  username: "",
                  role: "",
                  id: "",
                  name: "",
                  image: "",
                  phone: "",
               },
            };
         });
   },

   register: (user) => {
      return axios
         .post(`${API_URL}/users/register`, user)
         .then((res) => {
            return res.data;
         })
         .catch((err) => {
            return {
               error: err,
            };
         });
   },
   logout: () => {
      return axios
         .get(`${API_URL}/users/logout`)
         .then((res) => {
            return res.data;
         })
         .catch((err) => {
            return {
               error: err,
            };
         });
   },
   isAuthenticated: () => {
      return axios
         .get(`${API_URL}/users/authenticateduser`)
         .then((res) => {
            return res.data;
         })
         .catch(() => {
            return {
               isAuthenticated: false,
               user: { username: "", id: "", name: "", image: "", phone: "" },
            };
         });
   },
};
