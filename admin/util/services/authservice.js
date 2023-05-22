import { API_URL } from "../../../config";
import axios from "axios";
export default {
  login: (user) => {
    return axios
      .post(`${API_URL}/users/login`, user)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return {
          isAuthenticated: false,
          user: { username: "", role: "", id: "", name: "", image: "" },
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
      .get(`${API_URL}/users/authenticated`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return {
          isAuthenticated: false,
          user: { username: "", role: "", id: "", name: "", image: "" },
        };
      });
  },
};
