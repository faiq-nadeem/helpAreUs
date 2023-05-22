import { useEffect, useState } from "react";
import { Button, Form, Input, message, Row, Col, Typography } from "antd";
import { API_URL } from "../../config";
import IntlMessages from "../util/IntlMessages";
import { useRouter } from "next/router";
import axios from "axios";
import { useIntl } from "react-intl";

const SignInPage = () => {
  const intl = useIntl();

  const router = useRouter();
  const { token } = router.query;

  const [username, seTusername] = useState("");

  const getUserWithToken = async (token) => {
    await axios
      .get(API_URL + "/users/reset?resetPasswordToken=" + token)
      .then((res) => {
        if (res.data.message == "password reset link a-ok") {
          seTusername(res.data.username);
        }
      })
      .catch((err) => {
        message.error(
          intl.messages["app.userAuth.resetPasswordLinkNotValid"] + err
        );
        router.push("/forgotpassword");
      });
  };

  useEffect(() => {
    getUserWithToken(token);
  }, []);

  const onSubmit = (Data) => {
    axios
      .put(`${API_URL}/users/updatePasswordViaEmail`, {
        username: username,
        password: Data["password"],
        resetPasswordToken: token,
      })
      .then((res) => {
        if (
          res.data.message == "password reset link is invalid or has expired"
        ) {
          message.error(
            intl.messages["app.userAuth.resetPasswordLinkNotValid"]
          );
        } else if (res.data.message == "no user exists in db to update") {
          message.error(intl.messages["app.userAuth.userNotFound"]);
        } else {
          message.success(intl.messages["app.userAuth.resetPasswordOk"]);
          router.push("/signin");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col sm={6} offset={3} xs={18}>
          <Typography.Title className="text-center mt-5">
            NextLy
          </Typography.Title>
          <div level={5} className="text-center fs-10 mb-5">
            Fortune favors the bold.
          </div>
          {username ? (
            <Form
              initialValues={{ remember: true }}
              onFinish={onSubmit}
              layout="vertical"
            >
              <Form.Item
                name="password"
                label={intl.messages["app.pages.common.password"]}
                rules={[
                  {
                    message: intl.messages["app.pages.common.pleaseFill"],
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
                        intl.messages["app.pages.common.passwordNotMatch"]
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  className="mb-0 w-full"
                  size="large"
                  htmlType="submit"
                >
                  <IntlMessages id="app.pages.common.save" />
                </Button>
              </Form.Item>
            </Form>
          ) : (
            ""
          )}

          <Button type="link" onClick={() => router.push("/signin")}>
            <IntlMessages id="app.userAuth.signIn" />
          </Button>
        </Col>
        <Col sm={3} xs={0} />

        <Col sm={12} xs={24}>
          <div className="loginBanner"></div>
        </Col>
      </Row>
    </>
  );
};

export default SignInPage;
