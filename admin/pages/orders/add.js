import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import router from "next/router";
import { DeleteOutlined } from "@ant-design/icons";
import Price from "../../app/components/Price";
import {
  Table,
  Popconfirm,
  Radio,
  Button,
  Card,
  message,
  Divider,
  Col,
  Form,
  Input,
  Row,
  Select,
} from "antd";
import func from "../../util/helpers/func";
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ getData = [] }) => {
  const intl = useIntl();
  const [state, seTstate] = useState({
    products: [],
    discount_price: 0,
    total_price: 0,
    cargo_price: 0,
  });
  const [fields, seTfields] = useState(
    Object.entries(getData).map(([name, value]) => ({ name, value }))
  );

  const [customerdata, seTcustomerdata] = useState([]);
  const [customerdataAll, seTcustomerdataAll] = useState([]);
  const [customerSingle, seTcustomerSingle] = useState([]);
  const [paymentMethodsData, seTpaymentMethodsData] = useState([]);
  const [orderStatus, seTorderStatus] = useState([]);
  const [cargoes, seTcargoes] = useState([]);
  const [allCargoes, seTallCargoes] = useState([]);
  const [billingAddress, seTbillingAddress] = useState([]);
  const [shippingAddress, seTshippingAddress] = useState([]);
  const [productsData, seTproductsData] = useState([]);
  const [productDataAll, seTproductDataAll] = useState([]);
  const [productsAdd, seTproductsAdd] = useState({});
  const [priceAdd, seTpriceAdd] = useState({
    before_price: 0,
    price: 0,
    qty: 1,
  });

  const { user } = useSelector(({ login }) => login);
  const [form] = Form.useForm();

  // componentDidMount = useEffect
  useEffect(() => {
    getDataOrderStatusFc();
    getDataCustomersFc();
    getDataPaymentMethodsFc();
    getDataCargoesFc();
    getDataProductsFc();
  }, []);

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const onSubmit = async (Data) => {
    Data["created_user"] = { name: user.name, id: user.id };
    Data["customer"] = customerSingle;
    Data["products"] = state.products;
    Data["discount_price"] = state.discount_price;

    Data["total_price"] = state.total_price;
    Data["cargo_price"] = state.cargo_price;

    console.log(Data);

    axios
      .post(`${API_URL}/orders/add`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.orders.notAdded"] + res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.orders.added"]);

          router.push("/orders/list");
        }
      })
      .catch((err) => console.log(err));
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  const getDataCustomersFc = () => {
    axios
      .get(API_URL + "/customers")
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [{ label: "Guest", value: null }];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].name + " " + res.data[i].surname,
              value: res.data[i]._id,
            });
          }

          seTcustomerdata(dataManipulate);
          seTcustomerdataAll(res.data);
        }
      })
      .catch((err) => console.log(err));
  };
  const getDataProductsFc = () => {
    axios
      .get(API_URL + "/products")
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }

          seTproductsData(dataManipulate);
          seTproductDataAll(res.data);
        }
      })
      .catch((err) => console.log(err));
  };
  const getDataPaymentMethodsFc = () => {
    axios
      .get(API_URL + "/paymentmethods")
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }

          seTpaymentMethodsData(dataManipulate);
        }
      })
      .catch((err) => console.log(err));
  };
  const getDataCargoesFc = () => {
    axios
      .get(API_URL + "/cargoes")
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }

          seTcargoes(dataManipulate);
          seTallCargoes(res.data);
        }
      })
      .catch((err) => console.log(err));
  };
  const getDataOrderStatusFc = () => {
    axios
      .get(API_URL + "/orderstatus")
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }

          seTorderStatus(dataManipulate);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <Card className="card" title={intl.messages["app.pages.orders.add"]}>
        <Form
          {...formItemLayout}
          form={form}
          name="add"
          onFinishFailed={onFinishFailed}
          onFinish={onSubmit}
          fields={fields}
          scrollToFirstError
        >
          <Form.Item
            name="orderstatus_id"
            label={intl.messages["app.pages.orders.status"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={orderStatus}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              showSearch
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option.props.label.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
              }
            />
          </Form.Item>
          <Divider />

          <Form.Item
            name="paymentmethods_id"
            label={intl.messages["app.pages.orders.paymentMethod"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={paymentMethodsData}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              showSearch
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option.props.label.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
              }
            />
          </Form.Item>
          <Form.Item
            name="cargoes_id"
            label={intl.messages["app.pages.orders.cargo"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={cargoes}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              showSearch
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option.props.label.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
              }
              onChange={(newValue) => {
                seTstate({ ...state, cargoes_id: newValue });
                const cargoesPrice = allCargoes.find(
                  (val) => val._id == newValue
                );
                seTstate({ ...state, cargo_price: cargoesPrice.price });
              }}
            />
          </Form.Item>

          <Form.Item
            name="customer_id"
            label={intl.messages["app.pages.orders.customer"]}
          >
            <Select
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={customerdata}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              showSearch
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option.props.label.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
              }
              onChange={(newValue) => {
                if (newValue != null) {
                  const data = customerdataAll.find((x) => x._id === newValue);
                  seTcustomerSingle(data);

                  const dataManipulate = [];
                  for (const i in data.address) {
                    dataManipulate.push({
                      label:
                        data.address[i].name +
                        " -" +
                        data.address[i].address +
                        " " +
                        data.address[i].village_id +
                        " " +
                        data.address[i].district_id +
                        " " +
                        data.address[i].town_id +
                        " " +
                        data.address[i].city_id,
                      value:
                        data.address[i].address +
                        " " +
                        data.address[i].village_id +
                        " " +
                        data.address[i].district_id +
                        " " +
                        data.address[i].town_id +
                        " " +
                        data.address[i].city_id,
                    });
                  }
                  seTbillingAddress(dataManipulate);
                  seTshippingAddress(dataManipulate);
                  seTfields(
                    Object.entries({
                      receiver_name: data.name + " " + data.surname,
                      receiver_email: data.username,
                      receiver_phone: data.prefix + data.phone,
                    }).map(([name, value]) => ({ name, value }))
                  );
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="receiver_name"
            label={intl.messages["app.pages.orders.receiverName"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="receiver_email"
            label={intl.messages["app.pages.orders.receiverEmail"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="receiver_phone"
            label={intl.messages["app.pages.orders.receiverPhone"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseSelect"],
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col sm={12}>
              <Form.Item
                label={intl.messages["app.pages.orders.selectBillingAddress"]}
                labelAlign="left"
                labelCol={{ span: 20 }}
                wrapperCol={{ span: 24 }}
              >
                <Select
                  style={{ width: "100%" }}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  options={billingAddress}
                  placeholder={intl.messages["app.pages.common.pleaseSelect"]}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.value
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    option.props.label
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={(newValue) => {
                    seTstate({ ...state, billing_address: newValue });
                    seTfields(
                      Object.entries({
                        ...fields,
                        billing_address: newValue,
                      }).map(([name, value]) => ({ name, value }))
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col sm={12}>
              <Form.Item
                label={intl.messages["app.pages.orders.selectShippingAddress"]}
                labelAlign="left"
                labelCol={{ span: 20 }}
                wrapperCol={{ span: 24 }}
              >
                <Select
                  style={{ width: "100%" }}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  options={shippingAddress}
                  placeholder={intl.messages["app.pages.common.pleaseSelect"]}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.value
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    option.props.label
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={(newValue) => {
                    seTstate({ ...state, shipping_address: newValue });
                    seTfields(
                      Object.entries({
                        ...fields,
                        shipping_address: newValue,
                      }).map(([name, value]) => ({ name, value }))
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col sm={12}>
              <Form.Item
                name="billing_address"
                label={intl.messages["app.pages.orders.billingAddress"]}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: intl.messages["app.pages.common.pleaseSelect"],
                    whitespace: true,
                  },
                ]}
              >
                <Input.TextArea
                  onChange={(newValue) => {
                    seTstate({
                      ...state,
                      billing_address: newValue.target.value,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col sm={12}>
              <Form.Item
                name="shipping_address"
                label={intl.messages["app.pages.orders.shippingAddress"]}
                labelAlign="left"
                rules={[
                  {
                    required: true,
                    message: intl.messages["app.pages.common.pleaseSelect"],
                    whitespace: true,
                  },
                ]}
              >
                <Input.TextArea
                  onChange={(newValue) => {
                    seTstate({
                      ...state,
                      shipping_address: newValue.target.value,
                    });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Divider />
          <Form.Item
            name="product_data"
            label={intl.messages["app.pages.orders.selectProducts"]}
          >
            <Select
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={productsData}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              showSearch
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                  0 ||
                option.props.label.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
              }
              onChange={(newValue) => {
                const data = [];
                data.push(productDataAll.find((x) => x._id == newValue));

                data[0].qty = Number(1);
                seTproductsAdd(...data);
                seTpriceAdd({
                  qty: data[0].qty,
                  price: data[0].price * data[0].qty,
                  before_price: data[0].before_price * data[0].qty,
                });
              }}
            />
          </Form.Item>

          <>
            {productsAdd?.title ? (
              <Row gutter={[16, 16]}>
                <Col sm={6}>
                  <label>
                    <IntlMessages id="app.pages.common.title" />: <br />
                  </label>

                  <Input
                    onChange={(x) => {
                      seTproductsAdd({ ...productsAdd, title: x.target.value });
                    }}
                    value={productsAdd.title}
                  />
                </Col>
                <Col sm={10}>
                  {productsAdd.type ? (
                    <>
                      <label>
                        <IntlMessages id="app.pages.common.variants" />: <br />
                      </label>

                      {productsAdd.variants.map((x, i) => (
                        <div key={i}>
                          <Form.Item
                            name={x.name}
                            label={x.name}
                            labelAlign="left"
                            rules={[
                              {
                                required: true,
                                message:
                                  intl.messages[
                                    "app.pages.common.pleaseSelect"
                                  ],
                                whitespace: true,
                              },
                            ]}
                          >
                            <Radio.Group
                              name={x.name}
                              options={x.value}
                              optionType="button"
                              buttonStyle="solid"
                              required
                              onChange={(x) => {
                                const data = productsAdd;
                                data.selectedVariants = {
                                  ...data.selectedVariants,
                                  [x.target.name]: x.target.value,
                                };

                                const priceMath = func.filter_array_in_obj(
                                  data.variant_products,
                                  data.selectedVariants
                                );

                                seTproductsAdd(data);
                                seTproductsAdd({
                                  ...productsAdd,
                                  price: priceMath[0].price,
                                  before_price: priceMath[0].before_price,
                                });

                                seTpriceAdd({
                                  qty: priceAdd.qty,
                                  price: priceMath[0].price * priceAdd.qty,
                                  before_price:
                                    priceMath[0].before_price * priceAdd.qty,
                                });
                              }}
                            />
                          </Form.Item>
                        </div>
                      ))}
                    </>
                  ) : (
                    ""
                  )}
                </Col>
                <Col sm={2}>
                  <label>
                    <IntlMessages id="app.pages.common.qty" />: <br />
                  </label>
                  <div>
                    <Input
                      type="number"
                      onChange={(x) => {
                        seTpriceAdd({
                          qty: x.target.value,
                          price: productsAdd.price * x.target.value,
                          before_price:
                            productsAdd.before_price * x.target.value,
                        });
                      }}
                      value={priceAdd.qty}
                    />
                  </div>
                </Col>
                <Col sm={2}>
                  <label>
                    <IntlMessages id="app.pages.common.price" />: <br />
                  </label>
                  <div>
                    <Input value={priceAdd.price} />
                    {priceAdd.before_price != 0 ? (
                      <div>
                        {" "}
                        <IntlMessages id="app.pages.common.beforePrice" />:
                        <span style={{ textDecoration: "line-through" }}>
                          {priceAdd.before_price}
                        </span>{" "}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </Col>
                <Col sm={2}>
                  <Button
                    type="primary"
                    className="mt-4"
                    onClick={() => {
                      form
                        .validateFields()
                        .then(() => {
                          const data = state.products;

                          data.push({
                            _id: productsAdd._id,
                            seo: productsAdd.seo,
                            title: productsAdd.title,
                            selectedVariants: productsAdd.selectedVariants,
                            type: productsAdd.type,
                            categories_id: productsAdd.categories_id,
                            price: priceAdd.price,
                            qty: priceAdd.qty,
                            before_price: priceAdd.before_price,
                          });

                          let total_price = 0;
                          let discount_price = 0;

                          data.forEach((val) => {
                            total_price = Number(val.price) + total_price;
                            discount_price =
                              Number(val.before_price) + discount_price;
                          });

                          seTstate({
                            ...state,
                            products: data,
                            total_price,
                            discount_price,
                          });
                          seTpriceAdd({ before_price: 0, price: 0, qty: 1 });

                          if (productsAdd.type) {
                            const variantSetUndefined = {};
                            Object.keys(productsAdd.selectedVariants).forEach(
                              function (key) {
                                variantSetUndefined[key] = undefined;
                              }
                            );
                            form.setFieldsValue(variantSetUndefined);
                          }

                          form.setFieldsValue({
                            product_data: undefined,
                          });

                          seTproductsAdd({});
                        })
                        .catch((err) => console.log("err", err));
                    }}
                  >
                    <IntlMessages id="app.pages.common.addItem" />
                  </Button>
                </Col>

                <Divider />
              </Row>
            ) : (
              ""
            )}
          </>
          <Divider />

          <Table
            columns={[
              {
                title: intl.messages["app.pages.common.title"],
                dataIndex: "title",
                key: "title",
                render: (text) => <span className="link">{text}</span>,
              },
              {
                title: intl.messages["app.pages.common.selectedVariants"],
                dataIndex: "selectedVariants",
                key: "selectedVariants",
                render: (text, record) => {
                  const variants = [];

                  for (const property in record.selectedVariants) {
                    variants.push(
                      <div>
                        {" "}
                        {property}: {record.selectedVariants[property]}{" "}
                      </div>
                    );
                  }
                  return variants.length > 1 ? variants : "Single Product";
                },
              },
              {
                title: intl.messages["app.pages.common.qty"],
                dataIndex: "qty",
                key: "qty",
                render: (text) => text,
              },
              {
                title: intl.messages["app.pages.common.price"],
                dataIndex: "price",
                key: "price",
                render: (text) => text.toLocaleString(),
              },
              {
                title: intl.messages["app.pages.common.action"],
                dataIndex: "action",
                key: "action",
                render: (text, record) => (
                  <Popconfirm
                    placement="left"
                    title={intl.messages["app.pages.common.sureToDelete"]}
                    onConfirm={() => {
                      let filteredArray = state.products.filter(
                        (item) => item !== record
                      );
                      let total_price = 0;
                      let discount_price = 0;

                      filteredArray.forEach((val) => {
                        total_price = Number(val.price) + total_price;
                        discount_price =
                          Number(val.before_price) + discount_price;
                      });
                      seTstate({
                        ...state,
                        products: filteredArray,
                        total_price,
                        discount_price,
                      });
                    }}
                  >
                    <a>
                      <DeleteOutlined
                        style={{ fontSize: "150%", marginLeft: "15px" }}
                      />{" "}
                    </a>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={false}
            dataSource={[...state.products]}
            rowKey="_id"
          />
          <table className=" w-64 mt-4 float-right text-right">
            <tr className="text-md">
              <td>
                <IntlMessages id="app.pages.common.price" />
              </td>
              <td>:</td>
              <td>
                <Price data={state.total_price} />
              </td>
            </tr>
            <tr className="text-md">
              <td>
                <IntlMessages id="app.pages.orders.cargo" />
              </td>
              <td>:</td>
              <td>
                <Price data={state.cargo_price} />
              </td>
            </tr>
            <tr className="text-lg">
              <td>
                <IntlMessages id="app.pages.orders.totalPrice" />
              </td>
              <td>:</td>
              <td>
                <Price data={state.total_price + state.cargo_price} />
              </td>
            </tr>
          </table>

          <div style={{ clear: "both" }}></div>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">
              <IntlMessages id="app.pages.common.save" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Default;
