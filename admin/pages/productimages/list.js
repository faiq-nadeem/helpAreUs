import { useEffect, useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { Select, message, Image, Table, Popconfirm, Button } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL, IMG_URL } from "../../../config";
import router from "next/router";
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ getData = [] }) => {
  const intl = useIntl();
  const [data, seTdata] = useState(getData);
  const [dataProducts, seTdataProducts] = useState([]);
  const { user } = useSelector(({ login }) => login);
  const { role } = user;
  const { id } = router.query;

  const columns = [
    {
      title: intl.messages["app.pages.common.order"],
      dataIndex: "order",
      key: "order",
    },
    {
      title: intl.messages["app.pages.common.title"],
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="link">{text}</span>,
    },
    {
      title: intl.messages["app.pages.common.image"],
      dataIndex: "image",
      key: "image",
      render: (text, record) => (
        <>
          <Image src={IMG_URL + record.image} height={80} />
        </>
      ),
    },
    {
      title: intl.messages["app.pages.common.action"],
      key: "_id",
      width: 360,
      render: (text, record) => (
        <span className="link ant-dropdown-link">
          {role["productimages/id"] ? (
            <Link href={"/productimages/" + record._id}>
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
          {role["productimagesdelete"] ? (
            <>
              {record.children ? (
                ""
              ) : (
                <Popconfirm
                  placement="left"
                  title={intl.messages["app.pages.common.youSure"]}
                  onConfirm={() => deleteData(record._id, record.image, id)}
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

  const getDataFc = (id) => {
    axios
      .get(API_URL + "/productimages")
      .then((res) => {
        if (res.data.length > 0) {
          const data = res.data;
          if (id) {
            seTdata(data.filter((x) => x.product_id?._id == id));
          } else {
            seTdata(data);
          }
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDataFc(id);
    getDataProducts();
  }, []);

  const getDataProducts = () => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }
          seTdataProducts(dataManipulate);
        }
      })
      .catch((err) => console.log(err));
  };

  const deleteData = (id, imagePath = 0, quertId) => {
    console.log(quertId);

    axios.delete(`${API_URL}/productimages/${id}`).then(() => {
      message.success(intl.messages["app.pages.common.deleteData"]);
      getDataFc(quertId);
      Router.push("/productimages/list?id=" + quertId);
    });

    if (imagePath != 0) {
      axios
        .post(`${API_URL}/upload/deleteproductimage`, { path: imagePath })
        .then(() => {
          message.success(intl.messages["app.pages.common.deleteData"]);
          getDataFc(quertId);
          Router.push("/productimages/list?id=" + quertId);
        });
    }
  };

  return (
    <div>
      <IntlMessages id="app.pages.productimages.product" /> :{" "}
      <Select
        defaultValue={id}
        options={dataProducts}
        onChange={(id) => {
          getDataFc(id);
          Router.push("/productimages/list?id=" + id);
        }}
        className=" w-50"
      />
      <div className="w-full">
        {role["productimages/add"] ? (
          <Link href={"/productimages/add?id=" + id}>
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

        <Table
          title={() => intl.messages["app.pages.productimages.list"]}
          columns={columns}
          pagination={{ position: "bottom" }}
          dataSource={data}
          expandable={{ defaultExpandAllRows: true }}
          rowKey="_id"
        />
      </div>
    </div>
  );
};

Default.getInitialProps = async ({ req, query }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const res = await axios.get(API_URL + "/productimages", {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });

    const dataManipulate = res.data;

    if (query.id) {
      return {
        getData: dataManipulate.filter((x) => x.product_id._id == query.id),
      };
    } else {
      return { getData: dataManipulate };
    }
  }
};

export default Default;
