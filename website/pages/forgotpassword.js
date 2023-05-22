import { Button, Form, Input, message } from "antd";
import { API_URL } from "../../config";
import Router from "next/router";
import axios from "axios";

import dynamic from "next/dynamic";
const IntlMessages = dynamic(() => import("../util/IntlMessages"));

const SignInPage = () => {

   const onSubmit = (Data) => {
      axios
         .post(`${API_URL}/users/forgotpasswordcustomer`, Data)
         .then((res) => {
            if (res.data == "email not in db") {
               message.error("email not in db");
            } else {
               message.success(res.data);
            }
         })
         .catch((err) => {
            console.log("err", err);
            message.error(err);
         });
   };

   return (
      <div className=" container-custom  text-center items-center py-14">
         <Form
            initialValues={{ remember: true }}
            onFinish={onSubmit}
            layout="vertical"
            className="w-6/12 mx-auto"
         >
            <Form.Item
               rules={[
                  { required: true, message: "The input is not valid E-mail!" },
               ]}
               name="username"
               label="E-mail"
            >
               <Input size="large" />
            </Form.Item>

            <Form.Item>
               <Button
                  type="primary"
                  className="mb-0 w-full"
                  size="large"
                  htmlType="submit"
               >
            Send E-mail
               </Button>
            </Form.Item>
         </Form>
         <Button type="link" onClick={() => Router.push("/signin")}>
            <IntlMessages id="app.userAuth.signIn" />
         </Button>
      </div>
   );
};

export default SignInPage;
