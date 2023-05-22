import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, IMG_URL } from "../../../config";
import router from "next/router";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Upload,
  Space,
  Image,
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
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = () => {
  const intl = useIntl();
  const [state, seTstate] = useState({});
  const [displaySave, seTdisplaySave] = useState(true);
  const fields = Object.entries(state).map(([name, value]) => ({
    name,
    value,
  }));
  const [form] = Form.useForm();
  const { id } = router.query;

  function getDataFc() {
    axios.get(`${API_URL}/settings/${id}`).then((response) => {
      seTstate(response.data);
    });
  }
  // componentDidMount = useEffect
  useEffect(() => {
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
      axios.post(`${API_URL}/upload/deletelogoimage`, { path: state.image });

      const formData = new FormData();
      formData.append("image", Data.image.file.originFileObj);

      const dataImage = await axios.post(
        `${API_URL}/upload/uploadlogoimage`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      Data["image"] = dataImage.data.path.replace("../admin/public/", "/");
    }

    axios
      .post(`${API_URL}/settings/${id}`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.settings.notUpdated"] + res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.settings.updated"]);
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
        title={intl.messages["app.pages.settings.settings"]}
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
            name="company"
            label={intl.messages["app.pages.common.company"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="taxnumber"
            label={intl.messages["app.pages.settings.taxNumber"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            name="taxcenter"
            label={intl.messages["app.pages.settings.taxCenter"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="website"
            label={intl.messages["app.pages.settings.website"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input />
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
            <Input />
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
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="keywords"
            label={intl.messages["app.pages.common.keywords"]}
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
            name="price_icon"
            label={intl.messages["app.pages.product.priceIcon"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
            extra="$,€,₺,USD,CAD"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price_type"
            label={intl.messages["app.pages.product.priceType"]}
          >
            <Select
              className=" w-full"
              options={[
                {
                  label: intl.messages["app.pages.product.start"],
                  value: true,
                },
                { label: intl.messages["app.pages.product.end"], value: false },
              ]}
              placeholder={intl.messages[" $20 or 20$"]}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label={intl.messages["app.pages.common.uploatedImage"]}
          >
            <Image src={IMG_URL + state.image} width={200} />
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
                {" "}
                <IntlMessages id="app.pages.common.selectFile" />
              </Button>
            </Upload>
          </Form.Item>
          <Divider />
          <Row gutter={[20, 20]}>
            {/* <Col md={24} >
              <Row gutter={[20]}>
                <Col md={8} className="text-end mt-2">
                  <h6><IntlMessages id="app.pages.settings.anyData" />:</h6>
                </Col>
                <Col md={16}>
                  <Form.List
                    name="anydata"
                    initialValue={[
                      { name: "", value: "" }
                    ]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, i) => (
                          <Space key={field.key} style={{ display: 'flex-start', alignItems: "flex-start", marginBottom: 8 }} block align="baseline">
                            <Form.Item
                              {...field}
                              label={intl.messages["app.pages.common.name"]}
                              className="float-left"

                              name={[field.name, 'name']}
                              fieldKey={[field.fieldKey, 'name']}
                              rules={[{ required: true, message: intl.messages["app.pages.common.pleaseFill"] }]}

                              labelCol={24}
                              wrapperCol={24}

                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.values"]}
                              name={[field.name, 'value']}
                              fieldKey={[field.fieldKey, 'value']}
                              rules={[{ required: true, message: intl.messages["app.pages.common.pleaseFill"] }]}

                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              className="float-left"
                            >
                              {fields.length > 1 ? <Button type="primary" shape="circle" onClick={() => remove(field.name)} icon={<DeleteOutlined />} /> : null}
                            </Form.Item>
                          </Space>

                        ))}

                        <Form.Item labelCol={24} wrapperCol={24} className="float-right w-full" >
                          <Button className="float-right w-full" type="dashed" onClick={() => { add() }} icon={<PlusOutlined />}>
                            <IntlMessages id="app.pages.settings.addSights" />
                          </Button>
                        </Form.Item>
                      </>

                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col> 
            <Divider />
            */}
            {/* <Col md={24} >
              <Row gutter={[20]}>
                <Col md={8} className="text-end mt-2">
                  <h6><IntlMessages id="app.pages.settings.companyUser" />:</h6>
                </Col>
                <Col md={16}>

                  <Form.List
                    name="company_user"
                    initialValue={[
                      { name: "", mail: "", phone: "" }
                    ]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, i) => (
                          <Space key={field.key} style={{ display: 'flex-start', alignItems: "flex-start", marginBottom: 8 }} block align="baseline">
                            <Form.Item
                              {...field}
                              label={intl.messages["app.pages.common.name"]}
                              className="float-left"
                              name={[field.name, 'name']}
                              fieldKey={[field.fieldKey, 'name']}
                              rules={[{ required: true, message: intl.messages["app.pages.common.pleaseFill"] }]}

                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.email"]}
                              name={[field.name, 'mail']}
                              fieldKey={[field.fieldKey, 'mail']}
                              rules={[{ required: true, message: intl.messages["app.pages.common.pleaseFill"] }]}

                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>

                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.phone"]}
                              name={[field.name, 'phone']}
                              fieldKey={[field.fieldKey, 'phone']}
                              rules={[{ required: true, message: intl.messages["app.pages.common.pleaseFill"] }]}

                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>

                            <Form.Item
                              className="float-left"
                            >
                              {fields.length > 1 ? <Button type="primary" shape="circle" onClick={() => remove(field.name)} icon={<DeleteOutlined />} /> : null}
                            </Form.Item>
                          </Space>

                        ))}

                        <Form.Item labelCol={24} wrapperCol={24} className="float-right w-full" >
                          <Button className="float-right w-full" type="dashed" onClick={() => { add() }} icon={<PlusOutlined />}>
                            <IntlMessages id="app.pages.settings.addSights" />
                          </Button>
                        </Form.Item>
                      </>

                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col> 
            <Divider />
            */}

            <Col md={24}>
              <Row gutter={[20]}>
                <Col md={8} className="text-end mt-2">
                  <h6>
                    <IntlMessages id="app.pages.common.email" />:
                  </h6>
                </Col>
                <Col md={16}>
                  <Form.List
                    label={intl.messages["app.pages.common.email"]}
                    name="email"
                    initialValue={[{ name: "", value: "" }]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => (
                          <Space
                            key={field.key}
                            style={{
                              display: "flex-start",
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                            block
                            align="baseline"
                          >
                            <Form.Item
                              {...field}
                              label={intl.messages["app.pages.common.name"]}
                              className="float-left"
                              name={[field.name, "name"]}
                              fieldKey={[field.fieldKey, "name"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.values"]}
                              name={[field.name, "value"]}
                              fieldKey={[field.fieldKey, "value"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item className="float-left">
                              {fields.length > 1 ? (
                                <Button
                                  type="primary"
                                  shape="circle"
                                  onClick={() => remove(field.name)}
                                  icon={<DeleteOutlined />}
                                />
                              ) : null}
                            </Form.Item>
                          </Space>
                        ))}

                        <Form.Item
                          labelCol={24}
                          wrapperCol={24}
                          className="float-right w-full"
                        >
                          <Button
                            className="float-right w-full"
                            type="dashed"
                            onClick={() => {
                              add();
                            }}
                            icon={<PlusOutlined />}
                          >
                            <IntlMessages id="app.pages.settings.addSights" />
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col>
            <Divider />
            <Col md={24}>
              <Row gutter={[20]}>
                <Col md={8} className="text-end mt-2">
                  <h6>
                    <IntlMessages id="app.pages.common.address" />:
                  </h6>
                </Col>
                <Col md={16}>
                  <Form.List
                    name="address"
                    initialValue={[{ name: "", value: "" }]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => (
                          <Space
                            key={field.key}
                            style={{
                              display: "flex-start",
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                            block
                            align="baseline"
                          >
                            <Form.Item
                              {...field}
                              label={intl.messages["app.pages.common.name"]}
                              className="float-left"
                              name={[field.name, "name"]}
                              fieldKey={[field.fieldKey, "name"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.values"]}
                              name={[field.name, "value"]}
                              fieldKey={[field.fieldKey, "value"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item className="float-left">
                              {fields.length > 1 ? (
                                <Button
                                  type="primary"
                                  shape="circle"
                                  onClick={() => remove(field.name)}
                                  icon={<DeleteOutlined />}
                                />
                              ) : null}
                            </Form.Item>
                          </Space>
                        ))}

                        <Form.Item
                          labelCol={24}
                          wrapperCol={24}
                          className="float-right w-full"
                        >
                          <Button
                            className="float-right w-full"
                            type="dashed"
                            onClick={() => {
                              add();
                            }}
                            icon={<PlusOutlined />}
                          >
                            <IntlMessages id="app.pages.settings.addSights" />
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col>

            <Divider />
            <Col md={24}>
              <Row gutter={[20]}>
                <Col md={8} className="text-end mt-2">
                  <h6>
                    <IntlMessages id="app.pages.common.phone" />:
                  </h6>
                </Col>
                <Col md={16}>
                  <Form.List
                    name="phone"
                    label={intl.messages["app.pages.common.phone"]}
                    initialValue={[{ name: "", value: "" }]}
                  >
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => (
                          <Space
                            key={field.key}
                            style={{
                              display: "flex-start",
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                            block
                            align="baseline"
                          >
                            <Form.Item
                              {...field}
                              label={intl.messages["app.pages.common.name"]}
                              className="float-left"
                              name={[field.name, "name"]}
                              fieldKey={[field.fieldKey, "name"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              className="float-left"
                              label={intl.messages["app.pages.common.values"]}
                              name={[field.name, "value"]}
                              fieldKey={[field.fieldKey, "value"]}
                              rules={[
                                {
                                  required: true,
                                  message:
                                    intl.messages[
                                    "app.pages.common.pleaseFill"
                                    ],
                                },
                              ]}
                              labelCol={24}
                              wrapperCol={24}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item className="float-left">
                              {fields.length > 1 ? (
                                <Button
                                  type="primary"
                                  shape="circle"
                                  onClick={() => remove(field.name)}
                                  icon={<DeleteOutlined />}
                                />
                              ) : null}
                            </Form.Item>
                          </Space>
                        ))}

                        <Form.Item
                          labelCol={24}
                          wrapperCol={24}
                          className="float-right w-full"
                        >
                          <Button
                            className="float-right w-full"
                            type="dashed"
                            onClick={() => {
                              add();
                            }}
                            icon={<PlusOutlined />}
                          >
                            <IntlMessages id="app.pages.settings.addSights" />
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col>
          </Row>
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
export default Default;
