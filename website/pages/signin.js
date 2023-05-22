import { useEffect } from "react";
import { Form, message } from "antd";
import { isAuthenticated_r, login_r } from "../redux/actions";
import axios from "axios";
import { API_URL } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import Router from "next/router";
import AuthService from "../util/services/authservice";
import { setCookies } from "cookies-next";

import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("../app/components/Header/LoginForm"));
const RegisterForm = dynamic(() => import("../app/components/Header/RegisterForm"));

const SignInPage = () => {
   const [form] = Form.useForm();

   const dispatch = useDispatch();
   const { isAuthenticated } = useSelector((state) => state.login);

   useEffect(() => {
      if (isAuthenticated) {
         return Router.push("/");
      }
   }, [isAuthenticated]);

   const onSubmitSignup = (Data) => {
      Data["username"] = Data.username.toLowerCase();

      axios
         .post(`${API_URL}/users/register`, Data)
         .then((res) => {
            if (res.data.error) {
               message.error(res.data.messagge);
            } else {
               form.resetFields();
               message.success(res.data.messagge);
               onSubmitLogin(Data);
            }
         })
         .catch((err) => console.log("err", err));
   };

   const handleCancelLogin = () => { };

   const onSubmitLogin = (Data) => {
      Data["username"] = Data.username.toLowerCase();

      AuthService.login(Data).then((data) => {
         const { isAuthenticated, user } = data;

         if (isAuthenticated) {
            dispatch(login_r(user));
            dispatch(isAuthenticated_r(true));
            Router.push("/");
            message.success("Login Successfully");
            setCookies("isuser", true);
            handleCancelLogin();
         } else {
            message.error("Login not Successfully");
         }
      });
   };

   return (
      <>
         <div className="grid container-custom gap-10 p-20 grid-cols-12">
            <div className="col-span-6">
               <div className="text-lg font-semibold col-span-12 text-brand-color  mb-5 ">
                  Login{" "}
               </div>
               <LoginForm
                  onSubmitLogin={onSubmitLogin}
                  handleCancelLogin={handleCancelLogin}
               />
            </div>

            <div className="col-span-6">
               <div className="text-lg font-semibold col-span-12 text-brand-color  mb-5 ">
                  Register{" "}
               </div>
               <RegisterForm onSubmitSignup={onSubmitSignup} />
            </div>
         </div>
      </>
   );
};

export default SignInPage;
