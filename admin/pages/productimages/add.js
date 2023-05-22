import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import router from "next/router";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Upload,
  InputNumber,
  Button,
  Card,
  message,
  Divider,
  Form,
  Input,
  Select,
} from "antd";
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ getProducts = [] }) => {
  const intl = useIntl();
  const { id } = router.query;
  const [state, seTstate] = useState({
    product_id: null,
    arrayImage: [
      { order: 1 },
      { order: 2 },
      { order: 3 },
      { order: 4 },
      { order: 5 },
    ],
  });
  const [displaySave, seTdisplaySave] = useState(true);
  const fields = Object.entries(state).map(([name, value]) => ({
    name,
    value,
  }));
  const [dataProducts, seTdataProducts] = useState([
    { label: intl.messages["app.pages.productimages.nonProduct"], value: null },
    ...getProducts,
  ]);
  const { user } = useSelector(({ login }) => login);
  const [form] = Form.useForm();

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

  // componentDidMount = useEffect
  useEffect(() => {
    getDataProducts();
    seTstate({ ...state, product_id: id });
  }, []);

  const onSubmit = async (Data) => {
    Data.arrayImage.map(async (value) => {
      value["created_user"] = { name: user.name, id: user.id };
      value["product_id"] = Data.product_id;

      if (value.image != undefined) {
        const formData = new FormData();
        formData.append("image", value.image.file.originFileObj);

        const dataImage = await axios.post(
          `${API_URL}/upload/uploadproductimage`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        value["image"] = dataImage.data.path.replace("../admin/public/", "/");

        axios
          .post(`${API_URL}/productimages/add`, value)
          .then((res) => {
            if (res.data.variant == "error") {
              message.error(
                intl.messages["app.pages.productimages.notAdded"] +
                res.data.messagge
              );
            } else {
              message.success(intl.messages["app.pages.productimages.added"]);

              router.push("/productimages/list?id=" + id);
            }
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <div>
      <Card
        className="card"
        title={intl.messages["app.pages.productimages.add"]}
      >
        <Form
          form={form}
          name="add"
          onFinishFailed={onFinishFailed}
          onFinish={onSubmit}
          fields={fields}
          scrollToFirstError
          {...formItemLayout}
        >
          <Form.Item
            name="product_id"
            label={intl.messages["app.pages.common.category"]}
          >
            <Select
              style={{ width: "100%" }}
              value={state.product_id}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              options={dataProducts}
              placeholder={intl.messages["app.pages.common.pleaseSelect"]}
              treeDefaultExpandAll
              onChange={(newValue) => {
                seTstate({ ...state, product_id: newValue });
              }}
            />
          </Form.Item>
          <Form.List name="arrayImage">
            {(fields, { add }) => (
              <>
                {fields.map((field, i) => (
                  <div className="grid grid-cols-12 " key={i}>
                    <div className="col-span-3"></div>
                    <Form.Item
                      label={intl.messages["app.pages.common.order"]}
                      initialValue={1 + i}
                      className="col-span-3"
                      name={[field.name, "order"]}
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
                      name={[field.name, "title"]}
                      label={intl.messages["app.pages.common.title"]}
                      className="col-span-3"
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name={[field.name, "image"]}
                      label={intl.messages["app.pages.common.image"]}
                      className="col-span-3"
                    >
                      <Upload
                        maxCount={1}
                        beforeUpload={(file) => {
                          const isJPG =
                            file.type === "image/jpeg" ||
                            file.type === "image/png" ||
                            file.type === "image/jpg" ||
                            file.type === "image/gif";
                          if (!isJPG) {
                            message.error(
                              intl.messages["app.pages.common.onlyImage"]
                            );
                            seTdisplaySave(false);
                            return false;
                          } else {
                            seTdisplaySave(true);

                            return true;
                          }
                        }}
                        showUploadList={{
                          removeIcon: (
                            <DeleteOutlined
                              onClick={() => seTdisplaySave(true)}
                            />
                          ),
                        }}
                      >
                        <Button icon={<UploadOutlined />}>
                          <IntlMessages id="app.pages.common.selectFile" />{" "}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </div>
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
                    <IntlMessages id="app.pages.common.addItem" />
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider />
          <Form.Item className="float-right">
            <Button type="primary" htmlType="submit" disabled={!displaySave}>
              <IntlMessages id="app.pages.common.save" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

Default.getInitialProps = async ({ req }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const getDataProducts = await axios.get(`${API_URL}/products`, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const getDataProductsManipulate = [];
    if (getDataProducts.data.length > 0) {
      for (const i in getDataProducts.data) {
        getDataProductsManipulate.push({
          label: getDataProducts.data[i].title,
          value: getDataProducts.data[i]._id,
        });
      }
    }
    return { getProducts: getDataProductsManipulate };
  }
};

export default Default;
