import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { useRouter } from "next/router";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
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
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ dataCityOption = [], dataCity = [], getData = [] }) => {
  const [city, seTcity] = useState(dataCity);
  const [selectedO, seTselectedO] = useState({});
  const [countryOption, seTcountryOption] = useState([]);
  const [country, seTcountry] = useState([]);
  const [state, seTstate] = useState(getData);
  const [fields, seTfields] = useState(
    Object.entries(state).map(([name, value]) => ({ name, value }))
  );
  const [cityOption, seTcityOption] = useState(dataCityOption);
  const [ilceOption, seTilceOption] = useState([]);
  const [semtOption, seTsemtOption] = useState([]);
  const [mahalleOption, seTmahalleOption] = useState([]);
  const [form] = Form.useForm();

  const intl = useIntl();
  const router = useRouter();
  const { id } = router.query;

  function getDataFc() {
    axios.get(`${API_URL}/customers/${id}`).then((response) => {
      const data = response.data;
      data["password"] = "";
      seTstate(data);
      seTfields(Object.entries(data).map(([name, value]) => ({ name, value })));
    });
  }

  const getCountry = () => {
    axios.get(`${API_URL}/country`).then((getData) => {
      const dataManipulate = [];
      for (const i in getData.data) {
        dataManipulate.push({
          label: getData.data[i].name,
          value: getData.data[i].name,
        });
      }
      seTcountryOption(dataManipulate);
      seTcountry(getData.data);
    });
  };
  // componentDidMount = useEffect
  useEffect(() => {
    getCountry();
    getDataFc();
  }, []);

  const getCity = () => {
    axios.get(`${API_URL}/turkey`).then((getData) => {
      const dataManipulate = [];
      for (const i in getData.data) {
        dataManipulate.push({
          label: getData.data[i].Il,
          value: getData.data[i].Il,
        });
      }
      seTcityOption(dataManipulate);
      seTcity(getData.data);
    });
  };

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

  const formItemLayout2 = {
    labelCol: {
      sm: { span: 24 },
      xs: { span: 24 },
    },
    wrapperCol: {
      sm: { span: 24 },
      xs: { span: 24 },
      style: { width: "100%", float: "left", padding: "0" },
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

  const changePrefix = (selected) => {
    seTstate({
      ...state,
      prefix: selected,
    });
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select onChange={changePrefix} style={{ width: 70 }}>
        <Select.Option value="90">+90</Select.Option>
      </Select>
    </Form.Item>
  );

  function updatePassword(pass) {
    axios
      .post(`${API_URL}/staff/updatePasswordCustomer`, {
        _id: id,
        password: pass,
      })
      .then((res) => {
        if (res.data.variant == "success") {
          message.success(intl.messages["app.pages.customers.passwordUpdated"]);
        } else {
          message.error(
            intl.messages["app.pages.customers.passwordNotUpdated"] +
              res.data.messagge
          );
        }
      })
      .catch((err) => console.log(err));
  }

  const onSubmit = (Data) => {
    if (Data.password != "") {
      updatePassword(Data.password);
    }

    axios
      .post(`${API_URL}/customers/${id}`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.customers.notUpdated"] + res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.customers.updated"]);

          router.push("/customers/list");
        }
      })
      .catch((err) => console.log(err));
  };

  const onChangeNameValue = (e) => {
    seTstate({ ...state, [e.target.name]: e.target.value });
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <div>
      <Form
        {...formItemLayout}
        form={form}
        name="add"
        onFinishFailed={onFinishFailed}
        onFinish={onSubmit}
        fields={fields}
        scrollToFirstError
      >
        <Row>
          <Col md={24}>
            <Card className="card" title="Customer Add">
              <Form.Item
                name="username"
                label={intl.messages["app.pages.common.userName"]}
                rules={[
                  {
                    type: "email",
                    message: intl.messages["app.pages.common.inputNotValid"],
                  },
                  {
                    required: true,
                    message: intl.messages["app.pages.common.inputNotValid"],
                  },
                ]}
              >
                <Input name="username" onChange={onChangeNameValue} />
              </Form.Item>
              <Form.Item
                name="password"
                label={intl.messages["app.pages.common.confirmPassword"]}
                rules={[
                  {
                    message: intl.messages["app.pages.common.inputNotValid"],
                  },
                ]}
                hasFeedback
              >
                <Input.Password name="password" onChange={onChangeNameValue} />
              </Form.Item>
              <Form.Item
                name="confirm"
                label={intl.messages["app.pages.common.confirmPassword"]}
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    message: intl.messages["app.pages.common.inputNotValid"],
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        intl.messages["app.pages.common.passwordNotMatch"]
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="name"
                label={intl.messages["app.pages.customers.name"]}
                rules={[
                  {
                    required: true,
                    message: "Please input your name!",
                    whitespace: true,
                  },
                ]}
              >
                <Input name="name" onChange={onChangeNameValue} />
              </Form.Item>
              <Form.Item
                name="surname"
                label={intl.messages["app.pages.customers.surname"]}
                rules={[
                  {
                    required: true,
                    message: "Please input your surname!",
                    whitespace: true,
                  },
                ]}
              >
                <Input name="surname" onChange={onChangeNameValue} />
              </Form.Item>
              <Form.Item
                name="phone"
                label={intl.messages["app.pages.customers.phone"]}
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                ]}
              >
                <Input
                  name="phone"
                  onChange={onChangeNameValue}
                  addonBefore={prefixSelector}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Divider />
              <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  <IntlMessages id="app.pages.common.save" />
                </Button>
              </Form.Item>
            </Card>
          </Col>
          <Col md={24}>
            <Card
              className="card w-full"
              title={intl.messages["app.pages.customers.adressAdd"]}
            >
              <Form.List name="address" style={{ width: "100%" }}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, i) => (
                      <Row
                        className="float-left w-full "
                        gutter={[8, 8]}
                        key={i}
                      >
                        <Col xs={8}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left  w-full mx-0 px-0"
                            name={[field.name, "name"]}
                            fieldKey={[field.fieldKey, "name"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            <Input
                              placeholder={
                                intl.messages["app.pages.customers.addressName"]
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={8}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left  w-full  mx-0 px-0"
                            name={[field.name, "type"]}
                            fieldKey={[field.fieldKey, "type"]}
                          >
                            <Select
                              defaultValue={true}
                              options={[
                                { label: "Billing Address", value: true },
                                { label: "Shipping Address", value: false },
                              ]}
                              placeholder="Select Address Type"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={7}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "country_id"]}
                            fieldKey={[field.fieldKey, "country_id"]}
                          >
                            <Select
                              showSearch
                              options={countryOption}
                              placeholder="Search to Country"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(selected) => {
                                if (selected == "Turkey") {
                                  getCity();
                                  seTselectedO({
                                    ...selectedO,
                                    selectedCountry: selected,
                                  });
                                } else {
                                  const citydata = country.filter(
                                    (x) => x.name === selected
                                  );
                                  const dataManipulate = [];

                                  for (const i in citydata[0].states) {
                                    dataManipulate.push({
                                      label: citydata[0].states[i].name,
                                      value: citydata[0].states[i].name,
                                    });
                                  }
                                  seTselectedO({
                                    ...selectedO,
                                    selectedCountry: selected,
                                  });
                                  seTcityOption(dataManipulate);
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={1}>
                          <Form.Item className="float-left">
                            <Button
                              type="primary"
                              shape="circle"
                              onClick={() => remove(field.name)}
                              icon={<DeleteOutlined />}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={6}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "city_id"]}
                            fieldKey={[field.fieldKey, "city_id"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            <Select
                              showSearch
                              options={cityOption}
                              placeholder={
                                intl.messages["app.pages.customers.addressCity"]
                              }
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.label
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={(selected) => {
                                if (selectedO.selectedCountry == "Turkey") {
                                  const ilce = city.filter(
                                    (x) => x.Il === selected
                                  );
                                  const dataManipulate = [];
                                  for (const i in ilce[0].Ilce) {
                                    dataManipulate.push({
                                      label: ilce[0].Ilce[i].Ilce,
                                      value: ilce[0].Ilce[i].Ilce,
                                    });
                                  }
                                  seTselectedO({
                                    ...selectedO,
                                    selectedCity: selected,
                                  });
                                  seTilceOption({
                                    option: dataManipulate,
                                    data: ilce[0].Ilce,
                                  });
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={6}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "town_id"]}
                            fieldKey={[field.fieldKey, "town_id"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            {selectedO.selectedCountry == "Turkey" ? (
                              <Select
                                showSearch
                                options={ilceOption.option}
                                name="town_id"
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressTown"
                                  ]
                                }
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(selected) => {
                                  const data = ilceOption.data.filter(
                                    (x) => x.Ilce === selected
                                  );
                                  const dataManipulate = [];
                                  for (const i in data[0].Semt) {
                                    dataManipulate.push({
                                      label: data[0].Semt[i].Semt,
                                      value: data[0].Semt[i].Semt,
                                    });
                                  }
                                  seTselectedO({
                                    ...selectedO,
                                    selectedIlce: selected,
                                  });
                                  seTsemtOption({
                                    option: dataManipulate,
                                    data: data[0].Semt,
                                  });
                                }}
                              />
                            ) : (
                              <Input
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressTown"
                                  ]
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={6}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "district_id"]}
                            fieldKey={[field.fieldKey, "district_id"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            {selectedO.selectedCountry == "Turkey" ? (
                              <Select
                                showSearch
                                options={semtOption.option}
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressDistrict"
                                  ]
                                }
                                name="district_id"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(selected) => {
                                  const data = semtOption.data.filter(
                                    (x) => x.Semt === selected
                                  );
                                  const dataManipulate = [];
                                  for (const i in data[0].Mahalle) {
                                    dataManipulate.push({
                                      label: data[0].Mahalle[i].Mahalle,
                                      value: data[0].Mahalle[i].Mahalle,
                                    });
                                  }
                                  seTselectedO({
                                    ...selectedO,
                                    selectedSemt: selected,
                                  });
                                  seTmahalleOption({
                                    option: dataManipulate,
                                    data: data[0].Mahalle,
                                  });
                                }}
                              />
                            ) : (
                              <Input
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressDistrict"
                                  ]
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={6}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "village_id"]}
                            fieldKey={[field.fieldKey, "village_id"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            {selectedO.selectedCountry == "Turkey" ? (
                              <Select
                                showSearch
                                options={mahalleOption.option}
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressNeighbour"
                                  ]
                                }
                                name="village_id"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.label
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(selected) => {
                                  seTselectedO({
                                    ...selectedO,
                                    selectedMahalle: selected,
                                  });
                                }}
                              />
                            ) : (
                              <Input
                                placeholder={
                                  intl.messages[
                                    "app.pages.customers.addressNeighbour"
                                  ]
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item
                            {...field}
                            {...formItemLayout2}
                            className="float-left w-full  mx-0 px-0"
                            name={[field.name, "address"]}
                            fieldKey={[field.fieldKey, "address"]}
                            rules={[
                              { required: true, message: "Missing Area" },
                            ]}
                          >
                            <Input.TextArea
                              rows={3}
                              placeholder={
                                intl.messages["app.pages.customers.addressFull"]
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Divider />
                      </Row>
                    ))}

                    <Form.Item className="float-right">
                      <Button
                        className="float-right"
                        type="dashed"
                        onClick={() => {
                          add();
                        }}
                        icon={<PlusOutlined />}
                      >
                        <IntlMessages id="app.pages.customers.adressAdd" />
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

Default.getInitialProps = async ({ req, query }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const getData = await axios.get(API_URL + "/customers/" + query.id, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });

    getData.data["password"] = "";

    const getDataCity = await axios.get(`${API_URL}/turkey`, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const dataManipulate = [];
    for (const i in getDataCity.data) {
      dataManipulate.push({
        label: getDataCity.data[i].Il,
        value: getDataCity.data[i].Il,
      });
    }

    return {
      dataCityOption: dataManipulate,
      dataCity: getDataCity.data,
      getData: getData.data,
    };
  }
};

export default Default;
