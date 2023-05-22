import { useEffect, useState } from "react";
import { Button, Form, Input, message, Select, Divider } from "antd";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { API_URL } from "../../../../config";
import AuthService from "../../../util/services/authservice";
import axios from "axios";

const Defaut = () => {
   const [form] = Form.useForm();

   const intl = useIntl();
   const { user } = useSelector(({ login }) => login);
   const [fieldsUser, seTfieldsUser] = useState(
      Object.entries(user).map(([name, value]) => ({ name, value }))
   );
   const [state, seTstate] = useState([]);

   function getDataFc() {
      if (user.id) {
         axios.get(`${API_URL}/customers/${user.id}`).then((res) => {
            const data = res.data;
            data["password"] = "";
            seTstate(data);
            seTfieldsUser(
               Object.entries(data).map(([name, value]) => ({ name, value }))
            );
         });
      }
   }
   useEffect(() => {
      getDataFc();
   }, [user]);

   const onSubmitPassword = (pass) => {
      AuthService.login({
         username: state.username,
         password: pass.currentpassword,
      }).then((data) => {
         const { isAuthenticated } = data;
         if (isAuthenticated) {
            axios
               .post(`${API_URL}/staff/updatePasswordCustomer`, {
                  _id: state._id,
                  password: pass.password,
               })
               .then((res) => {
                  if (res.data.variant == "success") {
                     message.success(
                        intl.messages["app.pages.customers.passwordUpdated"]
                     );
                  } else {
                     message.error(
                        intl.messages["app.pages.customers.passwordNotUpdated"] +
                  res.data.messagge
                     );
                  }
               })
               .catch((err) => console.log(err));
         } else {
            message.error("Your current password does not match");
         }
      });
   };

   const onSubmit = (Data) => {
      axios
         .post(`${API_URL}/customers/${state._id}`, Data)
         .then((res) => {
            if (res.data.variant == "error") {
               message.error(
                  intl.messages["app.pages.customers.notUpdated"] + res.data.messagge
               );
            } else {
               message.success(intl.messages["app.pages.customers.updated"]);
            }
         })
         .catch((err) => console.log(err));
   };

   const changePrefix = (selected) => {
      seTstate({
         ...state,
         prefix: selected,
      });
   };
   const prefixSelector = (
      <Form.Item name="prefix" noStyle initialValue={"90"}>
         <Select onChange={changePrefix} style={{ width: 70 }}>
            <Select.Option value="90">+90</Select.Option>
         </Select>
      </Form.Item>
   );

   return (
      <>
         <div className="  h-full grid grid-cols-12 gap-0 sm:gap-10 p-0 m-0 w-full my-10 ">
            <div className=" col-span-12 lg:col-span-6 ">
               <Form
                  onFinish={onSubmit}
                  layout="vertical"
                  form={form}
                  fields={fieldsUser}
                  className="w-full"
               >
                  <Form.Item
                     name="username"
                     label="E-mail"
                     rules={[
                        {
                           type: "email",
                           message: "The input is not valid E-mail!",
                        },
                        {
                           required: true,
                           message: intl.messages["app.pages.common.inputNotValid"],
                        },
                     ]}
                  >
                     <Input />
                  </Form.Item>

                  <Form.Item
                     name="name"
                     label={intl.messages["app.pages.customers.name"]}
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
                     label={intl.messages["app.pages.customers.phone"]}
                     rules={[
                        {
                           required: true,
                           message: intl.messages["app.pages.common.pleaseFill"],
                        },
                     ]}
                  >
                     <Input addonBefore={prefixSelector} />
                  </Form.Item>

                  <Divider />
                  <Form.Item>
                     <Button type="primary" className="w-full" htmlType="submit">
                Update
                     </Button>
                  </Form.Item>
               </Form>
            </div>
            <div className=" col-span-12 lg:col-span-6 ">
               <Form onFinish={onSubmitPassword} layout="vertical">
                  <Form.Item
                     name="currentpassword"
                     label={intl.messages["app.pages.common.curretPassword"]}
                     rules={[
                        {
                           required: true,
                           message: intl.messages["app.pages.common.inputNotValid"],
                        },
                     ]}
                     hasFeedback
                  >
                     <Input.Password />
                  </Form.Item>

                  <Form.Item
                     name="password"
                     label={intl.messages["app.pages.common.password"]}
                     rules={[
                        {
                           required: true,
                           message: intl.messages["app.pages.common.inputNotValid"],
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
                           required: true,
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

                  <Divider />
                  <Form.Item>
                     <Button type="primary" className="w-full" htmlType="submit">
                Update Password
                     </Button>
                  </Form.Item>
               </Form>
            </div>
         </div>
      </>
   );
};

export default Defaut;
