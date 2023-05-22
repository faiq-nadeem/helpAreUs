import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URL } from "../../../config";
import router from "next/router";
import ImgCrop from "antd-img-crop";
import {
  Upload,
  Button,
  Card,
  message,
  Divider,
  Checkbox,
  Form,
  Input,
  Select,
} from "antd";
import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = () => {
  const intl = useIntl();
  const [state, seTstate] = useState({
    role: {
      staffonlyyou: true,
      "staff/add": false,
      "staff/id": true,
      "staff/list": false,
      staffdelete: false,
      staffview: true,

      customersonlyyou: false,
      "customers/add": true,
      "customers/id": true,
      "customers/list": true,
      customersdelete: true,
      customersview: true,

      productsonlyyou: false,
      "products/add": true,
      "products/id": true,
      "products/list": true,
      productsdelete: true,
      productsview: true,

      categoriesonlyyou: false,
      "categories/add": true,
      "categories/id": true,
      "categories/list": true,
      categoriesdelete: true,
      categoriesview: true,

      variantsonlyyou: false,
      "variants/add": true,
      "variants/id": true,
      "variants/list": true,
      variantsdelete: true,
      variantsview: true,

      ordersonlyyou: false,
      "orders/add": true,
      "orders/id": true,
      "orders/list": true,
      ordersdelete: true,
      ordersview: true,

      productimagesonlyyou: false,
      "productimages/add": true,
      "productimages/id": true,
      "productimages/list": true,
      productimagesdelete: true,
      productimagesview: true,

      paymentmethodsonlyyou: false,
      "paymentmethods/add": true,
      "paymentmethods/id": true,
      "paymentmethods/list": true,
      paymentmethodsdelete: true,
      paymentmethodsview: true,

      orderstatusonlyyou: false,
      "orderstatus/add": true,
      "orderstatus/id": true,
      "orderstatus/list": true,
      orderstatusdelete: true,
      orderstatusview: true,

      cargoesonlyyou: false,
      "cargoes/add": true,
      "cargoes/id": true,
      "cargoes/list": true,
      cargoesdelete: true,
      cargoesview: true,

      topmenuonlyyou: false,
      "topmenu/add": true,
      "topmenu/id": true,
      "topmenu/list": true,
      topmenudelete: true,
      topmenuview: true,

      brandsonlyyou: false,
      "brands/add": true,
      "brands/id": true,
      "brands/list": true,
      brandsdelete: true,
      brandsview: true,

      homeslideronlyyou: false,
      "homeslider/add": true,
      "homeslider/id": true,
      "homeslider/list": true,
      homesliderdelete: true,
      homesliderview: true,
    },
  });

  const fields = Object.entries(state).map(([name, value]) => ({
    name,
    value,
  }));

  const [fileList, setFileList] = useState([]);
  const onChangeImage = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreviewImage = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };

  const deleteImage = (file) => {
    console.log(file);
    console.log(fileList[0]);
  };

  const { user } = useSelector(({ login }) => login);
  const [form] = Form.useForm();

  // componentDidMount = useEffect
  useEffect(() => { }, []);

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
    Data["isCustomer"] = false;

    if (user?.role?.superadmin) {
      console.log("not super admin");
    } else {
      Data["role"] = { empty: true };
    }

    if (fileList.length > 0) {
      const dataImage = await axios.post(
        API_URL + "/upload/uploadstaffavatar",
        fileList
      );
      Data["image"] = dataImage.data.replace("../admin/public/", "/");
    } else {
      Data["image"] = "";
    }

    axios
      .post(`${API_URL}/staff/add`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.staff.notAdded"] + res.data.messagge
          );
        } else {
          const staffUpdate = res.data;

          staffUpdate["created_user"] = {
            name: res.data.data.name + " " + res.data.data.surname,
            id: res.data.data._id,
          };

          axios
            .post(`${API_URL}/staff/${res.data.data._id}`, staffUpdate)
            .then((res) => {
              if (res.data.variant == "error") {
                message.error(
                  intl.messages["app.pages.staff.notAdded"] + res.data.messagge
                );
              } else {
                message.success(intl.messages["app.pages.staff.added"]);

                router.push("/staff/list");
              }
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Select.Option value="90">+90</Select.Option>
      </Select>
    </Form.Item>
  );

  return (
    <div>
      <Card className="card" title="Staff Add">
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
            name="username"
            label={intl.messages["app.pages.common.email"]}
            rules={[
              {
                type: "email",
                message: intl.messages["app.pages.common.inputNotValid"],
              },
              {
                required: true,
                message:
                  intl.messages["app.userAuth.The input is not valid E-mail!"],
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={intl.messages["app.pages.common.password"]}
            rules={[
              {
                message:
                  intl.messages["app.userAuth.Please input your Password!"],
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={intl.messages["app.pages.common.confirmPassword"]}
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                message: intl.messages["app.pages.common.confirmPassword"],
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    intl.messages["app.pages.customers.passwordNotMatch"]
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="name"
            label={intl.messages["app.pages.common.name"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label={intl.messages["app.pages.customers.surname"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
                whitespace: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label={intl.messages["app.pages.common.phone"]}
            rules={[
              {
                required: true,
                message: intl.messages["app.pages.common.pleaseFill"],
              },
            ]}
          >
            <Input
              name="phone"
              addonBefore={prefixSelector}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="image"
            label={"Avatar " + intl.messages["app.pages.common.image"]}
          >
            <ImgCrop rotate quality={1} grid={true}>
              <Upload
                name="photo"
                listType="picture-card"
                fileList={fileList}
                onChange={onChangeImage}
                onPreview={onPreviewImage}
                maxCount={1}
                onRemove={deleteImage}
              >
                {fileList.length < 1 && "+ Upload"}
              </Upload>
            </ImgCrop>
          </Form.Item>

          {user?.role?.superadmin ? (
            <Form.Item
              label={intl.messages["app.pages.staff.premissions"]}
              name="role"
            >
              <IntlMessages id="app.pages.staff.staff" />
              <Divider />
              <Checkbox
                value={state.role["staffview"]}
                checked={state.role["staffview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staffview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["staffonlyyou"] = false;
                    deg["staff/list"] = false;
                    deg["staff/add"] = false;
                    deg["staff/id"] = false;
                    deg["staffdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["staffonlyyou"]}
                checked={state.role["staffonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staffonlyyou"] = e.target.checked;
                  deg["staff/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["staff/list"]}
                checked={state.role["staff/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staff/list"] = e.target.checked;
                  deg["staffonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["staff/add"]}
                checked={state.role["staff/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staff/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["staff/id"]}
                checked={state.role["staff/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staff/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["staffdelete"]}
                checked={state.role["staffdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["staffdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              Top Menu Content
              <Divider />
              <Checkbox
                value={state.role["topmenuview"]}
                checked={state.role["topmenuview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenuview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["topmenuonlyyou"] = false;
                    deg["topmenu/list"] = false;
                    deg["topmenu/add"] = false;
                    deg["topmenu/id"] = false;
                    deg["topmenudelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["topmenuonlyyou"]}
                checked={state.role["topmenuonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenuonlyyou"] = e.target.checked;
                  deg["topmenu/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["topmenu/list"]}
                checked={state.role["topmenu/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenu/list"] = e.target.checked;
                  deg["topmenuonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["topmenu/add"]}
                checked={state.role["topmenu/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenu/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["topmenu/id"]}
                checked={state.role["topmenu/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenu/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["topmenudelete"]}
                checked={state.role["topmenudelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["topmenudelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.customers" />
              <Divider />
              <Checkbox
                value={state.role["customersview"]}
                checked={state.role["customersview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customersview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["customersonlyyou"] = false;
                    deg["customers/list"] = false;
                    deg["customers/add"] = false;
                    deg["customers/id"] = false;
                    deg["customersdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["customersonlyyou"]}
                checked={state.role["customersonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customersonlyyou"] = e.target.checked;
                  deg["customers/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["customers/list"]}
                checked={state.role["customers/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customers/list"] = e.target.checked;
                  deg["customersonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["customers/add"]}
                checked={state.role["customers/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customers/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["customers/id"]}
                checked={state.role["customers/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customers/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["customersdelete"]}
                checked={state.role["customersdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["customersdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.products" />
              <Divider />
              <Checkbox
                value={state.role["productsview"]}
                checked={state.role["productsview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productsview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["productsonlyyou"] = false;
                    deg["products/list"] = false;
                    deg["products/add"] = false;
                    deg["products/id"] = false;
                    deg["productsdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["productsonlyyou"]}
                checked={state.role["productsonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productsonlyyou"] = e.target.checked;
                  deg["products/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["products/list"]}
                checked={state.role["products/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["products/list"] = e.target.checked;
                  deg["productsonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["products/add"]}
                checked={state.role["products/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["products/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["products/id"]}
                checked={state.role["products/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["products/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["productsdelete"]}
                checked={state.role["productsdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productsdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.productCategories" />
              <Divider />
              <Checkbox
                value={state.role["categoriesview"]}
                checked={state.role["categoriesview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categoriesview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["categoriesonlyyou"] = false;
                    deg["categories/list"] = false;
                    deg["categories/add"] = false;
                    deg["categories/id"] = false;
                    deg["categoriesdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["categoriesonlyyou"]}
                checked={state.role["categoriesonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categoriesonlyyou"] = e.target.checked;
                  deg["categories/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["categories/list"]}
                checked={state.role["categories/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categories/list"] = e.target.checked;
                  deg["categoriesonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["categories/add"]}
                checked={state.role["categories/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categories/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["categories/id"]}
                checked={state.role["categories/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categories/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["categoriesdelete"]}
                checked={state.role["categoriesdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["categoriesdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.categoryVariants" />
              <Divider />
              <Checkbox
                value={state.role["variantsview"]}
                checked={state.role["variantsview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variantsview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["variantsonlyyou"] = false;
                    deg["variants/list"] = false;
                    deg["variants/add"] = false;
                    deg["variants/id"] = false;
                    deg["variantsdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["variantsonlyyou"]}
                checked={state.role["variantsonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variantsonlyyou"] = e.target.checked;
                  deg["variants/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["variants/list"]}
                checked={state.role["variants/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variants/list"] = e.target.checked;
                  deg["variantsonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["variants/add"]}
                checked={state.role["variants/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variants/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["variants/id"]}
                checked={state.role["variants/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variants/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["variantsdelete"]}
                checked={state.role["variantsdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["variantsdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.orders" />
              <Divider />
              <Checkbox
                value={state.role["ordersview"]}
                checked={state.role["ordersview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["ordersview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["ordersonlyyou"] = false;
                    deg["orders/list"] = false;
                    deg["orders/add"] = false;
                    deg["orders/id"] = false;
                    deg["ordersdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["ordersonlyyou"]}
                checked={state.role["ordersonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["ordersonlyyou"] = e.target.checked;
                  deg["orders/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["orders/list"]}
                checked={state.role["orders/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orders/list"] = e.target.checked;
                  deg["ordersonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["orders/add"]}
                checked={state.role["orders/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orders/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["orders/id"]}
                checked={state.role["orders/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orders/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["ordersdelete"]}
                checked={state.role["ordersdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["ordersdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.productImages" />
              <Divider />
              <Checkbox
                value={state.role["productimagesview"]}
                checked={state.role["productimagesview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimagesview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["productimagesonlyyou"] = false;
                    deg["productimages/list"] = false;
                    deg["productimages/add"] = false;
                    deg["productimages/id"] = false;
                    deg["productimagesdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["productimagesonlyyou"]}
                checked={state.role["productimagesonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimagesonlyyou"] = e.target.checked;
                  deg["productimages/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["productimages/list"]}
                checked={state.role["productimages/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimages/list"] = e.target.checked;
                  deg["productimagesonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["productimages/add"]}
                checked={state.role["productimages/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimages/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["productimages/id"]}
                checked={state.role["productimages/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimages/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["productimagesdelete"]}
                checked={state.role["productimagesdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["productimagesdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.orderStatus" />
              <Divider />
              <Checkbox
                value={state.role["orderstatusview"]}
                checked={state.role["orderstatusview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatusview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["orderstatusonlyyou"] = false;
                    deg["orderstatus/list"] = false;
                    deg["orderstatus/add"] = false;
                    deg["orderstatus/id"] = false;
                    deg["orderstatusdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["orderstatusonlyyou"]}
                checked={state.role["orderstatusonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatusonlyyou"] = e.target.checked;
                  deg["orderstatus/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["orderstatus/list"]}
                checked={state.role["orderstatus/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatus/list"] = e.target.checked;
                  deg["orderstatusonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["orderstatus/add"]}
                checked={state.role["orderstatus/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatus/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["orderstatus/id"]}
                checked={state.role["orderstatus/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatus/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["orderstatusdelete"]}
                checked={state.role["orderstatusdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["orderstatusdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.paymentMethods" />
              <Divider />
              <Checkbox
                value={state.role["paymentmethodsview"]}
                checked={state.role["paymentmethodsview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethodsview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["paymentmethodsonlyyou"] = false;
                    deg["paymentmethods/list"] = false;
                    deg["paymentmethods/add"] = false;
                    deg["paymentmethods/id"] = false;
                    deg["paymentmethodsdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["paymentmethodsonlyyou"]}
                checked={state.role["paymentmethodsonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethodsonlyyou"] = e.target.checked;
                  deg["paymentmethods/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["paymentmethods/list"]}
                checked={state.role["paymentmethods/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethods/list"] = e.target.checked;
                  deg["paymentmethodsonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["paymentmethods/add"]}
                checked={state.role["paymentmethods/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethods/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["paymentmethods/id"]}
                checked={state.role["paymentmethods/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethods/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["paymentmethodsdelete"]}
                checked={state.role["paymentmethodsdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["paymentmethodsdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.brands" />
              <Divider />
              <Checkbox
                value={state.role["brandsview"]}
                checked={state.role["brandsview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brandsview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["brandsonlyyou"] = false;
                    deg["brands/list"] = false;
                    deg["brands/add"] = false;
                    deg["brands/id"] = false;
                    deg["brandsdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["brandsonlyyou"]}
                checked={state.role["brandsonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brandsonlyyou"] = e.target.checked;
                  deg["brands/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["brands/list"]}
                checked={state.role["brands/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brands/list"] = e.target.checked;
                  deg["brandsonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["brands/add"]}
                checked={state.role["brands/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brands/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["brands/id"]}
                checked={state.role["brands/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brands/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["brandsdelete"]}
                checked={state.role["brandsdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["brandsdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.homeSlider" />
              <Divider />
              <Checkbox
                value={state.role["homesliderview"]}
                checked={state.role["homesliderview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homesliderview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["homeslideronlyyou"] = false;
                    deg["homeslider/list"] = false;
                    deg["homeslider/add"] = false;
                    deg["homeslider/id"] = false;
                    deg["homesliderdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["homeslideronlyyou"]}
                checked={state.role["homeslideronlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homeslideronlyyou"] = e.target.checked;
                  deg["homeslider/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["homeslider/list"]}
                checked={state.role["homeslider/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homeslider/list"] = e.target.checked;
                  deg["homeslideronlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["homeslider/add"]}
                checked={state.role["homeslider/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homeslider/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["homeslider/id"]}
                checked={state.role["homeslider/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homeslider/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["homesliderdelete"]}
                checked={state.role["homesliderdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["homesliderdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
              <br /> <br />
              <br />
              <IntlMessages id="app.pages.staff.cargoes" />
              <Divider />
              <Checkbox
                value={state.role["cargoesview"]}
                checked={state.role["cargoesview"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoesview"] = e.target.checked;
                  if (e.target.checked == false) {
                    deg["cargoesonlyyou"] = false;
                    deg["cargoes/list"] = false;
                    deg["cargoes/add"] = false;
                    deg["cargoes/id"] = false;
                    deg["cargoesdelete"] = false;
                  }
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.viewPage" />
              </Checkbox>
              <Checkbox
                value={state.role["cargoesonlyyou"]}
                checked={state.role["cargoesonlyyou"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoesonlyyou"] = e.target.checked;
                  deg["cargoes/list"] = false;
                  console.log(deg);
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.onlyYouDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["cargoes/list"]}
                checked={state.role["cargoes/list"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoes/list"] = e.target.checked;
                  deg["cargoesonlyyou"] = false;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.allDataList" />
              </Checkbox>
              <Checkbox
                value={state.role["cargoes/add"]}
                checked={state.role["cargoes/add"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoes/add"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.addData" />
              </Checkbox>
              <Checkbox
                value={state.role["cargoes/id"]}
                checked={state.role["cargoes/id"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoes/id"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                {" "}
                <IntlMessages id="app.pages.staff.editData" />
              </Checkbox>
              <Checkbox
                value={state.role["cargoesdelete"]}
                checked={state.role["cargoesdelete"]}
                disabled={state.role["superadmin"] ? true : false}
                onChange={(e) => {
                  const deg = state.role;
                  deg["cargoesdelete"] = e.target.checked;
                  seTstate({ ...state, role: deg });
                }}
              >
                <IntlMessages id="app.pages.staff.deleteData" />
              </Checkbox>
            </Form.Item>
          ) : (
            ""
          )}

          <Divider />
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
