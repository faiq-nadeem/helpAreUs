import React, { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Divider, Avatar } from "antd";
import CircularProgress from "../app/components/CircularProgress";
import Clock from "../app/components/Clock";
import { IMG_URL } from "../../config";
import { UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const Orders = dynamic(() => import("./orders/list"), {
  loading: () => <CircularProgress />,
});

const Counts = dynamic(() => import("../app/components/Dashboard/counts"), {
  loading: () => <CircularProgress />,
});

const CrmDashboard = () => {
  const { user } = useSelector(({ login }) => login);
  useEffect(() => {}, []);

  return (
    <React.Fragment>
      <Head>
        <title>Dashboard</title>
      </Head>
      <div className="dashboardProfile">
        <Avatar
          size={180}
          src={IMG_URL + user.image}
          icon={<UserOutlined />}
          className="border   mt-5 mb-3"
        />
        <h4>{user.name}</h4>
        <Clock />
      </div>
      <div className="  mb-5 grid grid-cols-12">
        <Counts />
        <Divider />
        <div className=" mt-5 col-span-12">
          <Orders />
        </div>
      </div>
    </React.Fragment>
  );
};

export default CrmDashboard;
