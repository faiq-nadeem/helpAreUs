import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { API_URL } from "../../../config";
import { useRouter } from "next/router";

import {
  TreeSelect,
  InputNumber,
  Button,
  Card,
  message,
  Divider,
  Form,
  Input,
} from "antd";
import func from "../../util/helpers/func";

import { useIntl } from "react-intl";
import IntlMessages from "../../util/IntlMessages";

const Default = ({ getData = [], getCategories = [] }) => {
  const Editor = dynamic(() => import("../../app/components/Editor/index"));
  const intl = useIntl();
  const [state, seTstate] = useState(getData);
  const [editor, seTeditor] = useState(null);
  const [fields, seTfields] = useState(
    Object.entries(getData).map(([name, value]) => ({ name, value }))
  );
  const [dataCategories, seTdataCategories] = useState(getCategories);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = router.query;

  const getDataCategory = () => {
    axios
      .get(`${API_URL}/topmenu`)
      .then((res) => {
        if (res.data.length > 0) {
          const data = func.getCategoriesTreeOptions(res.data);
          data.unshift({
            label: intl.messages["app.pages.topmenu.rootCategory"],
            value: null,
          });
          seTdataCategories(data);
        }
      })
      .catch((err) => console.log(err));
  };

  function getDataFc() {
    axios.get(`${API_URL}/topmenu/${id}`).then((response) => {
      seTstate(response.data);
      seTfields(
        Object.entries(response.data).map(([name, value]) => ({ name, value }))
      );
    });
  }

  //componentDidMount = useEffect
  useEffect(() => {
    getDataCategory();
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

  const onSubmit = (Data) => {
    axios
      .post(`${API_URL}/topmenu/${id}`, Data)
      .then((res) => {
        if (res.data.variant == "error") {
          message.error(
            intl.messages["app.pages.topmenu.notUpdated"] + res.data.messagge
          );
        } else {
          message.success(intl.messages["app.pages.topmenu.updated"]);

          router.push("/topmenu/list");
        }
      })
      .catch((err) => console.log(err));
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
  };

  return (
    <div>
      <Card className="card" title={intl.messages["app.pages.topmenu.edit"]}>
        <Form
          {...formItemLayout}
          form={form}
          name="add"
          onFinishFailed={onFinishFailed}
          onFinish={onSubmit}
          scrollToFirstError
          fields={fields}
        >
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
              onChange={(newValue) => {
                if (newValue == "0-0") {
                  newValue = null;
                }
                seTstate({
                  ...state,
                  categories_id: newValue,
                });
                seTfields(
                  Object.entries({ categories_id: newValue }).map(
                    ([name, value]) => ({ name, value })
                  )
                );
              }}
            />
          </Form.Item>
          <Form.Item
            name="order"
            label={intl.messages["app.pages.common.order"]}
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
                seTfields(
                  Object.entries({
                    seo: func.replaceSeoUrl(e.target.value),
                  }).map(([name, value]) => ({ name, value }))
                );
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
            <Editor value={editor} seTeditor={seTeditor} form={form} />
          </Form.Item>
          <Form.Item name="seo" label="Seo Url" value={state.seo}>
            <Input />
          </Form.Item>
          <Form.Item
            name="link"
            label={intl.messages["app.pages.topmenu.otherLink"]}
          >
            <Input />
          </Form.Item>
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

Default.getInitialProps = async ({ req, query }) => {
  if (!req?.headers?.cookie) {
    return {};
  } else {
    const getData = await axios.get(API_URL + "/topmenu/" + query.id, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const geTdataManipulate = getData.data;

    const getDataCategories = await axios.get(`${API_URL}/topmenu`, {
      headers: req ? { cookie: req.headers.cookie } : undefined,
    });
    const geTdataCategoriesManipulate = func.getCategoriesTreeOptions(
      getDataCategories.data
    );
    geTdataCategoriesManipulate.unshift({
      label: "▣ Root Category ",
      value: null,
    });

    return {
      getData: geTdataManipulate,
      getCategories: geTdataCategoriesManipulate,
    };
  }
};

export default Default;
