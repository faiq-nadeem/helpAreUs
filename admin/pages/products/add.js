import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import router from "next/router";
import dynamic from "next/dynamic";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Tag,
  TreeSelect,
  InputNumber,
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

const Default = ({ getCategories = [] }) => {
  const Editor = dynamic(() => import("../../app/components/Editor/index"));
  const intl = useIntl();
  const [state, seTstate] = useState({ categories_id: null, type: 0 });
  const [dataCategories, seTdataCategories] = useState(getCategories);
  const [dataVariants, seTdataVariants] = useState([]);
  const [variantsOp, seTvariantsOp] = useState({ options: [""] });
  const [dataBrands, seTdataBrands] = useState([]);
  const [meta, seTmeta] = useState([]);
  const { user } = useSelector(({ login }) => login);

  const [form] = Form.useForm();

  const getDataBrands = () => {
    axios
      .get(`${API_URL}/brands`)
      .then((res) => {
        if (res.data.length > 0) {
          const dataManipulate = [];
          for (const i in res.data) {
            dataManipulate.push({
              label: res.data[i].title,
              value: res.data[i]._id,
            });
          }
          seTdataBrands(dataManipulate);
        }
      })
      .catch((err) => console.log(err));
  };

  // componentDidMount = useEffect
  useEffect(() => {
    getDataCategory();
    getDataVariants();
    getDataBrands();
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

  const onSubmit = (Data) => {
    Data["created_user"] = { name: user.name, id: user.id };

    axios
      .post(`${API_URL}/products/add`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.product.notAdded"] + res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.product.added"]);

          router.push("/products/list");
        }
      })
      .catch((err) => console.log(err));
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  const getDataCategory = () => {
    axios
      .get(`${API_URL}/categories`)
      .then((res) => {
        if (res.data.length > 0) {
          const data = func.getCategoriesTreeOptions(res.data, true);
          seTdataCategories(data);
        }
      })
      .catch((err) => console.log(err));
  };

  const getDataVariants = () => {
    axios
      .get(`${API_URL}/variants`)
      .then((res) => {
        if (res.data.length > 0) {
          const details = [];
          for (const i in res.data) {
            details.push({
              label: res.data[i].name,
              value: res.data[i].name,
            });
          }
          seTdataVariants({ options: details, data: res.data });
        }
      })
      .catch((err) => console.log(err));
  };

  let getProducts = (arrays) => {
    if (arrays.length === 0) {
      return [[]];
    }

    let results = [];

    getProducts(arrays.slice(1)).forEach((product) => {
      arrays[0].forEach((value) => {
        results.push([value].concat(product));
      });
    });

    return results;
  };

  let getAllCombinations = (attributes) => {
    let attributeNames = Object.keys(attributes);

    let attributeValues = attributeNames.map((name) => attributes[name]);

    return getProducts(attributeValues).map((product) => {
      const obj = {};
      attributeNames.forEach((name, i) => {
        obj[name] = product[i];
      });
      return obj;
    });
  };

  const selectVariants = () => {
    const formData = form.getFieldsValue();

    const varib = [];
    if (formData.variants.length > 0) {
      for (const i in formData.variants) {
        const varib2 = [];
        for (const j in formData.variants[i].value) {
          varib2.push(formData.variants[i].value[j]);
        }
        varib[formData.variants[i].name] = varib2;
      }

      const objToArr = getAllCombinations(varib);
      const DataS = [];
      for (const i in objToArr) {
        const variantsP = Object.entries(objToArr[i]).map(
          ([key, initialValue]) => ({ key, initialValue })
        );
        DataS.push(variantsP);
      }
      seTmeta(DataS);
    } else {
      seTmeta([]);
    }
  };

  return (
    <div>
      <Form
        {...formItemLayout}
        form={form}
        name="add"
        onFinishFailed={onFinishFailed}
        onFinish={onSubmit}
        fields={[
          {
            name: "categories_id",
            value: state.categories_id,
          },
          {
            name: "title",
            value: state.title,
          },

          {
            name: "description",
          },
          {
            name: "order",
          },

          {
            name: "seo",
            value: state.seo,
          },
          {
            name: "visible",
            value: true,
          },
          {
            name: "before_price",
            value: 0,
          },
          {
            name: "price",
            value: 0,
          },
          {
            name: "qty",
            value: 100,
          },
          {
            name: "saleqty",
            value: 0,
          },
        ]}
        scrollToFirstError
      >
        <Card className="card" title={intl.messages["app.pages.product.addd"]}>
          <Form.Item
            name="categories_id"
            label={intl.messages["app.pages.common.category"]}
          >
            <TreeSelect
              style={{ width: "100%" }}
              value={state.categories_id}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeData={dataCategories}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              treeDefaultExpandAll
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toLowerCase())
              }
              onChange={(newValue) => {
                seTstate({ ...state, categories_id: newValue });
              }}
            />
          </Form.Item>
          <Form.Item
            name="order"
            label={intl.messages["app.pages.common.order"]}
            initialValue={0}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="title"
            label={intl.messages["app.pages.common.title"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input
              onChange={(e) => {
                seTstate({
                  ...state,
                  title: e.target.value,
                  seo: func.replaceSeoUrl(e.target.value),
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="description_short"
            label={intl.messages["app.pages.common.descriptionShort"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.messages["app.pages.common.description"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Editor form={form} />
          </Form.Item>

          <Form.Item name="saleqty" initialValue={0} className="invisible">
            <Input />
          </Form.Item>
          <Form.Item name="seo" label="Seo Url" value={state.seo}>
            <Input />
          </Form.Item>

          <Form.Item
            name="brands_id"
            label={intl.messages["app.pages.common.brands"]}
          >
            <Select
              style={{ width: "100%" }}
              options={dataBrands}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
            />
          </Form.Item>
          <Divider />
          <Form.Item
            name="type"
            label={intl.messages["app.pages.product.productType"]}
          >
            <Select
              style={{ width: "100%" }}
              defaultValue={false}
              options={[
                {
                  label: intl.messages["app.pages.product.simple"],
                  value: false,
                },
                {
                  label: intl.messages["app.pages.product.variant"],
                  value: true,
                },
              ]}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              onChange={(newValue) => {
                seTstate({ ...state, type: newValue });
              }}
            />
          </Form.Item>
        </Card>

        <Card
          className="card"
          style={{ display: state.type ? "" : "none" }}
          title={intl.messages["app.pages.product.productType"]}
        >
          <Form.List name="variants" style={{ width: "100%" }}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, i) => (
                  <Row className="float-left w-full " gutter={[8, 8]} key={i}>
                    <Col xs={8}>
                      <Form.Item
                        {...field}
                        {...formItemLayout}
                        className="float-left w-full  mx-0 px-0"
                        name={[field.name, "name"]}
                        label={intl.messages["app.pages.common.variants"]}
                        fieldKey={[field.fieldKey, "variants"]}
                        hasFeedback
                        rules={[
                          {
                            message:
                              intl.messages["app.pages.common.confirmPassword"],
                          },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              const item = getFieldValue("variants").filter(
                                (x) => x.name === value
                              );

                              if (!value || item.length <= 1) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                intl.messages["app.pages.common.duplicate"]
                              );
                            },
                          }),
                        ]}
                      >
                        <Select
                          showSearch
                          options={dataVariants.options}
                          placeholder={
                            intl.messages["app.pages.common.searchVariant"]
                          }
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                          onChange={(selected) => {
                            const dataVariant = dataVariants.data.filter(
                              (x) => x.name === selected
                            );
                            const dataManipulate = [];
                            const datas = variantsOp.options;

                            for (const i in dataVariant[0].variants) {
                              dataManipulate.push({
                                label: dataVariant[0].variants[i].name,
                                value: dataVariant[0].variants[i].value,
                              });
                            }
                            datas[i] = dataManipulate;

                            seTvariantsOp({
                              options: datas,
                              data: dataVariant.variants,
                            });
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={15}>
                      <Form.Item
                        {...field}
                        {...formItemLayout}
                        className="float-left w-full  mx-0 px-0"
                        label={intl.messages["app.pages.common.values"]}
                        name={[field.name, "value"]}
                        fieldKey={[field.fieldKey, "value"]}
                        rules={[
                          {
                            required: true,
                            message:
                              intl.messages["app.pages.common.pleaseFill"],
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          mode="multiple"
                          showArrow
                          options={variantsOp.options[i]}
                          placeholder={
                            intl.messages["app.pages.common.searchVariant"]
                          }
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.label
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                          onChange={() => {
                            selectVariants();
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={1}>
                      <Form.Item className="float-left">
                        <Button
                          type="primary"
                          shape="circle"
                          onClick={() => {
                            remove(field.name);
                            selectVariants();
                          }}
                          icon={<DeleteOutlined />}
                        />
                      </Form.Item>
                    </Col>
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
                    <IntlMessages id="app.pages.common.addVariant" />
                  </Button>
                </Form.Item>
                <Divider />
              </>
            )}
          </Form.List>
          <Form.List name="variant_products">
            {() => (
              <>
                {meta.map((field, i) => (
                  <Form.List name={i} key={i}>
                    {() => (
                      <>
                        {field.map((field2, j) => (
                          <div name={j} key={j}>
                            <div className="float-left">
                              <h5 className="float-left text-xl pr-2">
                                {" "}
                                {j == 0
                                  ? intl.messages["app.pages.common.variants"]
                                  : ""}{" "}
                              </h5>{" "}
                              {field2.display == true ? (
                                ""
                              ) : (
                                <Tag color="blue" className="float-left">
                                  {field2.initialValue}
                                </Tag>
                              )}
                            </div>
                            <Form.Item
                              style={{
                                display: field2.display == true ? "" : "none",
                              }}
                              {...field2}
                              label={field2.label}
                              {...formItemLayout}
                              className="float-left w-full  mx-0 px-0"
                              name={field2.key}
                              defaultValue={field2.initialValue}
                              fieldKey={field2.fieldKey}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                            >
                              <Input />
                            </Form.Item>
                          </div>
                        ))}

                        <Form.Item
                          label={intl.messages["app.pages.common.price"]}
                          {...formItemLayout}
                          className="float-left w-full  mx-0 px-0"
                          name="price"
                          initialValue={1}
                          rules={[
                            {
                              required: true,
                              message:
                                intl.messages["app.pages.common.pleaseFill"],
                            },
                          ]}
                        >
                          <InputNumber className="!w-1/2" />
                        </Form.Item>

                        <Form.Item
                          label={intl.messages["app.pages.common.beforePrice"]}
                          {...formItemLayout}
                          className="float-left w-full  mx-0 px-0"
                          name="before_price"
                          initialValue={0}
                          rules={[
                            {
                              required: true,
                              message:
                                intl.messages["app.pages.common.pleaseFill"],
                            },
                          ]}
                        >
                          <InputNumber className="!w-1/2" />
                        </Form.Item>

                        <Form.Item
                          label={intl.messages["app.pages.common.qty"]}
                          {...formItemLayout}
                          className="float-left w-full  mx-0 px-0"
                          name="qty"
                          initialValue={100}
                          rules={[
                            {
                              required: true,
                              message:
                                intl.messages["app.pages.common.pleaseFill"],
                            },
                          ]}
                        >
                          <InputNumber className="!w-1/2" />
                        </Form.Item>

                        <Form.Item
                          name="saleqty"
                          initialValue={0}
                          className="invisible"
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item
                          name="visible"
                          label={intl.messages["app.pages.common.visible"]}
                          className="float-left w-full  mx-0 px-0"
                          initialValue={true}
                        >
                          <Select
                            className=" !w-1/5"
                            options={[
                              {
                                label:
                                  intl.messages["app.pages.common.beActive"],
                                value: true,
                              },
                              {
                                label:
                                  intl.messages["app.pages.common.bePassive"],
                                value: false,
                              },
                            ]}
                            placeholder={
                              intl.messages["app.pages.common.pleaseSelect"]
                            }
                          />
                        </Form.Item>

                        <Divider />
                      </>
                    )}
                  </Form.List>
                ))}
                <Divider />
              </>
            )}
          </Form.List>
        </Card>
        <Card className="card" style={{ display: state.type ? "none" : "" }}>
          <Form.Item
            name="before_price"
            label={intl.messages["app.pages.common.beforePrice"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="price"
            label={intl.messages["app.pages.common.price"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="qty"
            label={intl.messages["app.pages.common.qty"]}
            defaultValue={100}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <InputNumber style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="isActive"
            label={intl.messages["app.pages.common.visible"]}
            initialValue={true}
          >
            <Select
              style={{ width: "100%" }}

              options={[
                {
                  label: intl.messages["app.pages.common.beActive"],
                  value: true,
                },
                {
                  label: intl.messages["app.pages.common.bePassive"],
                  value: false,
                },
              ]}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
            />
          </Form.Item>
        </Card>

        <Card className="card">
          <Form.Item className="float-right">
            <Button type="primary" htmlType="submit">
              <IntlMessages id="app.pages.common.save" />
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

Default.getInitialProps = async ({ req }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const getDataCategories = await axios.get(`${API_URL}/categories`, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const geTdataCategoriesManipulate = [];
    if (getDataCategories.data.length > 0) {
      geTdataCategoriesManipulate.push(
        func.getCategoriesTreeOptions(getDataCategories.data, true)
      );
    }
    return { getCategories: geTdataCategoriesManipulate };
  }
};

export default Default;
