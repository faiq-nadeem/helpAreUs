import { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import {
  Select,
  message,
  Table,
  Popconfirm,
  Button,
  Tooltip,
  Radio,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import moment from "moment";
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ getData = [] }) => {
  const intl = useIntl();
  const [data, seTdata] = useState(getData);
  const [orderStatus, seTorderStatus] = useState([]);
  const { user } = useSelector(({ login }) => login);
  const { role } = user;

  const columns = [
    {
      title: intl.messages["app.pages.orders.orderNumber"],
      dataIndex: "ordernumber",
      key: "ordernumber",
    },
    {
      title: intl.messages["app.pages.orders.totalPrice"],
      dataIndex: "total_price",
      key: "total_price",
      render: (text, record) =>
        (record.total_price + record.cargo_price).toLocaleString(),
    },
    {
      title: intl.messages["app.pages.common.date"],
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <Tooltip placement="top" title={moment(text).fromNow()}>
          {moment(text).format("h:mm - DD/MM/YY")}
        </Tooltip>
      ),
    },

    {
      title: intl.messages["app.pages.common.action"],
      key: "_id",
      width: 360,
      render: (text, record) => (
        <span className="link ant-dropdown-link">
          {role["orders/id"] ? (
            <Link href={"/orders/" + record._id}>
              <a>
                {" "}
                <EditOutlined
                  style={{ fontSize: "150%", marginLeft: "15px" }}
                />
              </a>
            </Link>
          ) : (
            ""
          )}
          {role["ordersdelete"] ? (
            <>
              {record.children ? (
                ""
              ) : (
                <Popconfirm
                  placement="left"
                  title={intl.messages["app.pages.common.youSure"]}
                  onConfirm={() => deleteData(record._id, record.image)}
                >
                  <a>
                    <DeleteOutlined
                      style={{ fontSize: "150%", marginLeft: "15px" }}
                    />{" "}
                  </a>
                </Popconfirm>
              )}
            </>
          ) : (
            ""
          )}
        </span>
      ),
    },
  ];

  const getDataFc = () => {
    axios
      .get(API_URL + "/orders")
      .then((res) => {
        if (res.data.length > 0) {
          const data = res.data;
          seTdata(data);
        }
      })
      .catch((err) => console.log(err));
  };

  const getDataStatusFc = (target = "All") => {
    if (target == "All") {
      return getDataFc();
    }
    axios
      .get(API_URL + "/orders/status/" + target)
      .then((res) => {
        seTdata(res.data);
      })
      .catch((err) => console.log(err));
  };

  const getOrderStatus = () => {
    axios
      .get(API_URL + "/orderstatus")
      .then((res) => {
        if (res.data.length > 0) {
          const data = res.data;
          seTorderStatus(data);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getOrderStatus();
    getDataFc();
  }, []);

  const deleteData = (id, imagePath = 0) => {
    axios.delete(`${API_URL}/orders/${id}`).then(() => {
      message.success(intl.messages["app.pages.common.deleteData"]);
      getDataFc();
      Router.push("/orders/list");
    });

    if (imagePath != 0) {
      axios
        .post(`${API_URL}/upload/deleteproductimage`, { path: imagePath })
        .then(() => {
          message.success(intl.messages["app.pages.common.deleteData"]);
          getDataFc();
          Router.push("/orders/list");
        });
    }
  };

  return (
    <div>
      {role["ordersview"] ? (
        <>
          {role["orders/add"] ? (
            <Link href={"/orders/add"}>
              <Button
                type="primary"
                className="float-right addbtn"
                icon={<AppstoreAddOutlined />}
              >
                <IntlMessages id="app.pages.common.create" />
              </Button>
            </Link>
          ) : (
            ""
          )}
          <h5 className="mr-5 ">
            <IntlMessages id="app.pages.orders.list" />{" "}
          </h5>
          <Select
            defaultValue="All"
            className="w-full float-left mt-3 sm:hidden block"
            onChange={(val) => {
              getDataStatusFc(val);
            }}
          >
            <Select.Option value="All">
              <IntlMessages id="app.pages.orders.all" />
            </Select.Option>
            {orderStatus.map((item) => (
              <Select.Option ghost key={item._id} value={item._id}>
                {item.title}
              </Select.Option>
            ))}
          </Select>

          <Radio.Group
            defaultValue="All"
            className=" w-full mr-0 h-0 overflow-hidden sm:h-auto sm:overflow-auto  text-center  mx-auto   "
            buttonStyle="solid"
            onChange={(val) => {
              getDataStatusFc(val.target.value);
            }}
          >
            <Radio.Button value="All">
              <IntlMessages id="app.pages.orders.all" />
            </Radio.Button>
            {orderStatus.map((item) => (
              <Radio.Button ghost key={item._id} value={item._id}>
                {item.title}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Table
            columns={columns}
            pagination={{ position: "bottom" }}
            dataSource={[...data]}
            expandable={{ defaultExpandAllRows: true }}
            rowKey="_id"
          />
        </>
      ) : (
        ""
      )}
    </div>
  );
};

Default.getInitialProps = async ({ req }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const res = await axios.get(API_URL + "/orders", {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });

    const dataManipulate = res.data;

    return { getData: dataManipulate };
  }
};

export default Default;
