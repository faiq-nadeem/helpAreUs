import { Input, Form, Button } from "antd";
import Link from "next/link";
import IntlMessages from "../../../util/IntlMessages";

const Default = ({ onSubmitLogin, handleCancelLogin }) => {
   const [form] = Form.useForm();

   return (
      <div className="mb-5">
         <Form onFinish={onSubmitLogin} layout="vertical" form={form}>
            <Form.Item
               rules={[
                  {
                     required: true,
                     message: (
                        <IntlMessages id="app.userAuth.The input is not valid E-mail!" />
                     ),
                  },
               ]}
               name="username"
               label={<IntlMessages id="app.userAuth.E-mail" />}
            >
               <Input size="large" />
            </Form.Item>
            <Form.Item
               rules={[
                  {
                     required: true,
                     message: (
                        <IntlMessages id="app.userAuth.Please input your Password!" />
                     ),
                  },
               ]}
               name="password"
               label={<IntlMessages id="app.userAuth.Password" />}
            >
               <Input.Password size="large" />
            </Form.Item>
            <Form.Item>
               <Button
                  type="primary"
                  className="mb-0 w-full"
                  size="large"
                  htmlType="submit"
               >
                  <IntlMessages id="app.userAuth.signIn" />
               </Button>
            </Form.Item>
         </Form>
         <Link href="/forgotpassword">
            <Button
               type="link"
               className="float-left w-full mb-4"
               onClick={handleCancelLogin}
            >
          Forgot Password
            </Button>
         </Link>
         <div className="mt-5"></div>
      </div>
   );
};

export default Default;
