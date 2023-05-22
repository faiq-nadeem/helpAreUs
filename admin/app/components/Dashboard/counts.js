import React, { useEffect, useState } from "react";
import { Divider } from "antd";
import axios from "axios";
import { API_URL } from "../../../../config";

import {
  DollarCircleOutlined,
  UsergroupAddOutlined,
  CodeSandboxOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

import { useIntl } from "react-intl";
import IntlMessages from "../../../util/IntlMessages";

const CrmCounts = () => {
  const intl = useIntl();

  const [counts, seTcounts] = useState({
    order: 0,
    customer: 0,
    category: 0,
    product: 0,
  });
  const getCountsFc = async () => {
    const order = await axios
      .get(API_URL + "/orders/counts/")
      .then((res) => res.data);
    const customer = await axios
      .get(API_URL + "/customers/counts/")
      .then((res) => res.data);
    const category = await axios
      .get(API_URL + "/categories/counts/")
      .then((res) => res.data);
    const product = await axios
      .get(API_URL + "/products/counts/")
      .then((res) => res.data);
    seTcounts({ product, category, customer, order });
  };

  useEffect(() => {
    getCountsFc();
  }, []);

  return (
    <>
      <div className="m-2 col-span-6 lg:col-span-3">
        <div className="bg-black bg-gradient-to-b from-gray-500 to-black  text-white p-3 rounded-lg float-left w-full ">
          <span className=" text-3xl mb-3 float-left w-full">
            <IntlMessages id="component.count.totalOrders" />
          </span>
          <span className="text-5xl float-left w-50">{counts.order}</span>
          <DollarCircleOutlined className="text-5xl float-right" />
        </div>
      </div>

      <div className="m-2 col-span-6 lg:col-span-3">
        <div className="bg-black bg-gradient-to-b from-gray-500 to-black  text-white p-3 rounded-lg float-left w-full ">
          <span className=" text-3xl mb-3 float-left w-full">
            <IntlMessages id="component.count.totalCustomers" />
          </span>
          <span className="text-5xl float-left w-50">{counts.customer}</span>
          <UsergroupAddOutlined className="text-5xl float-right" />
        </div>
      </div>

      <div className="m-2 col-span-6 lg:col-span-3">
        <div className="bg-black bg-gradient-to-b from-gray-500 to-black  text-white p-3 rounded-lg float-left w-full ">
          <span className=" text-3xl mb-3 float-left w-full">
            <IntlMessages id="component.count.totalCategories" />
          </span>
          <span className="text-5xl float-left w-50">{counts.category}</span>
          <OrderedListOutlined className="text-5xl float-right" />
        </div>
      </div>

      <div className="m-2 col-span-6 lg:col-span-3">
        <div className="bg-black bg-gradient-to-b from-gray-500 to-black  text-white p-3 rounded-lg float-left w-full ">
          <span className=" text-3xl mb-3 float-left w-full">
            <IntlMessages id="component.count.totalProducts" />
          </span>
          <span className="text-5xl float-left w-50">{counts.product}</span>
          <CodeSandboxOutlined className="text-5xl float-right" />
        </div>
      </div>
    </>
  );
};

export default CrmCounts;
