import React, { useLayoutEffect, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { Layout } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { login_r, isAuthenticated_r } from "../../../redux/actions/Login";
import { changeCollapsed_r, settings_r } from "../../../redux/actions";

import { useRouter } from "next/router";

import CircularProgress from "../../components/CircularProgress";
import AuthService from "../../../util/services/authservice";
import axios from "axios";
import func from "../../../util/helpers/func";

axios.defaults.withCredentials = true;

const { Content } = Layout;

const Sidebar = dynamic(() => import("./Sidebar"), {
  loading: () => <CircularProgress />,
});

const Topheader = dynamic(() => import("./Topheader"), {
  loading: () => <CircularProgress />,
});

const AppLayout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { collapsed } = useSelector(({ settings }) => settings);
  const { isAuthenticated } = useSelector(({ login }) => login);

  const loginControl = async () => {
    dispatch(settings_r());
    if (!isAuthenticated) {
      AuthService.isAuthenticated().then(async (auth) => {
        if (auth.isAuthenticated) {
          await dispatch(login_r(auth.user));
          await dispatch(isAuthenticated_r(true));
        } else {
          if (router.pathname == "/signup") {
            router.push("/signup");
          } else if (router.pathname == "/forgotpassword") {
            router.push("/forgotpassword");
          } else if (router.pathname == "/resetpassword") {
            router.push({
              path: "/resetpassword",
              query: router.query,
            });
          } else {
            router.push("/signin");
          }
        }
      });
    }
  };

  useEffect(() => {
    loginControl();
  }, []);

  const isUnRestrictedRoute = (pathname) => {
    return (
      pathname === "/signin" ||
      pathname === "/signup" ||
      pathname === "/forgotpassword" ||
      pathname === "/resetpassword"
    );
  };

  return isUnRestrictedRoute(router.pathname) ? (
    children
  ) : (
    <>
      {isAuthenticated ? (
        <Layout>
          <Sidebar />

          <div
            className="mobileCollapse"
            style={{ display: !collapsed ? "block" : "none" }}
            onClick={() => dispatch(changeCollapsed_r(!collapsed))}
          />
          <Layout className="site-layout">
            <Topheader />
            <Content className="site-layout-background">{children}</Content>
          </Layout>
        </Layout>
      ) : (
        <div className="loader-view">
          <div className="loader">...............</div>
        </div>
      )}
    </>
  );
};

export default AppLayout;
