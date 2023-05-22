import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, IMG_URL } from "../../../config";
import router from "next/router";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Upload,
  Image,
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

const Default = ({ getProducts = [], getData = [] }) => {
  const intl = useIntl();
  const [state, seTstate] = useState(getData);
  const [displaySave, seTdisplaySave] = useState(true);
  const fields = Object.entries(state).map(([name, value]) => ({
    name,
    value,
  }));
  const [dataProducts, seTdataProducts] = useState(getProducts);
  const [form] = Form.useForm();
  const { id } = router.query;
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

  function getDataFc() {
    axios.get(`${API_URL}/productimages/${id}`).then((response) => {
      seTstate(response.data);
    });
  }
  // componentDidMount = useEffect
  useEffect(() => {
    getDataProducts();
    getDataFc();
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
    if (Data.image != undefined && state.image != Data.image) {
      axios.post(`${API_URL}/upload/deleteproductimage`, { path: state.image });

      const formData = new FormData();
      formData.append("image", Data.image.file.originFileObj);

      const dataImage = await axios.post(
        `${API_URL}/upload/uploadproductimage`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      Data["image"] = dataImage.data.path.replace("../admin/public/", "/");
    }

    //Data["image"] = state.image

    axios
      .post(`${API_URL}/productimages/${id}`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.productimages.notUpdated"] +
            res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.productimages.updated"]);

          router.push("/productimages/list?id=" + state.product_id);
        }
      })
      .catch((err) => console.log(err));
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <div>
      <Card
        className="card"
        title={intl.messages["app.pages.productimages.update"]}
      >
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
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label={intl.messages["app.pages.common.image"]}
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
                  message.error(intl.messages["app.pages.common.onlyImage"]);
                  seTdisplaySave(false);
                  return false;
                } else {
                  seTdisplaySave(true);

                  return true;
                }
              }}
              showUploadList={{
                removeIcon: (
                  <DeleteOutlined onClick={() => seTdisplaySave(true)} />
                ),
              }}
            >
              <Button icon={<UploadOutlined />}>
                <IntlMessages id="app.pages.common.selectFile" />
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="image"
            label={intl.messages["app.pages.common.uploatedImage"]}
          >
            <Image src={IMG_URL + state.image} width={200} />
          </Form.Item>

          <Divider />
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" disabled={!displaySave}>
              <IntlMessages id="app.pages.common.save" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

Default.getInitialProps = async ({ req, query }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const getData = await axios.get(API_URL + "/productimages/" + query.id, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const geTdataManipulate = getData.data;

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
    return {
      getData: geTdataManipulate,
      getProducts: getDataProductsManipulate,
    };
  }
};

export default Default;
