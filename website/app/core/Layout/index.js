import { useEffect } from "react";
import { Layout, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
   login_r,
   isAuthenticated_r,
   getBasket_r,
} from "../../../redux/actions";
import { useRouter } from "next/router";
import AuthService from "../../../util/services/authservice";
import axios from "axios";
import func from "../../../util/helpers/func";
import dynamic from "next/dynamic";

const CategoriesMenu = dynamic(() => import("../../components/CategoriesMenu"));
const TopMenu = dynamic(() => import("../../components/TopMenu"));
const Footer = dynamic(() => import("../../components/Footer"));
const Header = dynamic(() => import("../../components/Header"));

import { checkCookies } from "cookies-next";
const haveCookie = checkCookies("isuser");



axios.defaults.withCredentials = true;

const { Content } = Layout;

const AppLayout = ({ children }) => {

   const router = useRouter();
   const dispatch = useDispatch();
   const { errorFetch } = useSelector(({ settings }) => settings);
   const { isAuthenticated } = useSelector(({ login }) => login);
   const { topmenu } = useSelector(({ topmenu }) => topmenu);

   const loginControl = () => {
      if (!isAuthenticated) {
         AuthService.isAuthenticated().then((auth) => {
            if (auth.isAuthenticated) {
               dispatch(getBasket_r(auth.user.id));
               dispatch(login_r(auth.user));
               dispatch(isAuthenticated_r(true));
            }
         });
      }
   };

   const fetchError = () => {
      if (errorFetch) {
         message.error(errorFetch);
      }
   };



   useEffect(() => {
      if (haveCookie) {
         loginControl();
      }
      fetchError();


   }, [isAuthenticated]);

   const isUnRestrictedRoute = (pathname) => {
      return pathname === "/sitemap.xml";
   };

   return isUnRestrictedRoute(router.pathname) ? (
      children
   ) : (
      <>
         {/* <CircularProgress className={!isLoaded ? "visible" : "hidden"} /> */}
         <Layout>
            <div className="border-b bg-white">
               <div className=" container-custom   ">
                  <div className="h-7">
                     <TopMenu
                        socialmedia={func.getCategoriesTree(
                           topmenu,
                           "614b8cc75c153bab76bdf681"
                        )}
                        topmenu={func.getCategoriesTree(topmenu)}
                     />
                  </div>
                  <Header />
                  <div className="h-11">
                     <CategoriesMenu />
                  </div>
               </div>
            </div>
            <div className="  min-h-screen ">
               <Content >{children}</Content>
            </div>
            <Footer
               footerMenu={func.getCategoriesTree(
                  topmenu,
                  "6154a5a279053f941d1b786c"
               )}
            />
         </Layout>
      </>
   );
};

export default AppLayout;
