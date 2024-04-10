import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Input, Spin } from "antd";
import { EditOutlined , ReloadOutlined } from "@ant-design/icons";
import { SettingsGenericConfigUrl } from "../../utils/network";
import { CRUD } from "../../utils/js_functions";
import Loading from "../../utils/loadingPage";
import {
  getGenericConfig,
  updateGenericConfig,
} from "../../redux/slice";
import { formItemLayout } from "../../../src/utils/data"

const SettingsGenericConfig = () => {
 const [data, setData] = useState([]);
 
  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10);// Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);
  const [upgrade, setUpgrade] = useState(false)

  const [editId, setEditId] = useState(null);
  const [res, setRes] = useState({});
  const dispatch = useDispatch();
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);

  const genericConfig = useSelector((state) => state.utilities.genericConfig)

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

  // CRUD Operation
  const handleOk = () => {
    form.validateFields().then( async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        const updatedRes = await CRUD(
          "put",
          SettingsGenericConfigUrl,
          values,
          editId
        );
        dispatch(updateGenericConfig(updatedRes));
        setEditingItem(null);
      } else {
        await CRUD("post", SettingsGenericConfigUrl, values, null);
        // let res = await CRUD("get", SettingsGenericConfigUrl, null, null);
        dispatch(getGenericConfig([]));
        setUpgrade(true);
      }
    });
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    setEditId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const getItem = useCallback(async () => {
    //loading modal delay
    if (isLoading) {
      setVisible(true);
    } else {
      setTimeout(() => {
        setVisible(false);
      }, 1000);
    }
    setLoading(true);
    let updatedListTitles = [...listTitles];
    if (genericConfig) {
      setRes(genericConfig);
      let jsonData = { ...genericConfig };

      updatedListTitles = listTitles.map((item) => {
        const key =
          item.title.charAt(0).toLowerCase() +
          item.title
            .slice(1)
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase();
        if (jsonData[key] !== undefined) {
          return { ...item, description: jsonData[key] };
        }
        return item;
      });

      setData(updatedListTitles);
    } else setData(listTitles);
    setLoading(false);
  }, []);

  useEffect(() => {
    getItem();
    setUpgrade(false);
  }, [genericConfig]);

  const listTitles = [
    {
      title: "App title",
    },
    {
      title: "Platform",
    },
    {
      title: "Main color",
    },
    {
      title: "Secondary color",
    },
    {
      title: "Tertiary color",
    },
    {
      title: "Text color",
    },
    {
      title: "Main logo",
    },
    {
      title: "Image bg",
    },
    {
      title: "Backend version",
    },
  ];

 
  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <Button
            type="circle"
            style={{
              color: "white",
              background: "green",
            }}
            onClick={() => handleEdit(res)}
          >
            <EditOutlined style={{ size: 20 }} />
          </Button>
          <span style={{ margin: "0 8px" }} />
          <span
            style={{
              color: "green",
              fontSize: 20,
              fontFamily: "cursive",
            }}
          >
            Settings Generic Config
          </span>
          <Modal
            open={isModalVisible}
            title={editingItem ? "Edit Item" : "Add New Record"}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            onOk={handleOk}
          >
            <Form form={form} {...formItemLayout}>
              <Form.Item
                name="app_title"
                label="AppTitle"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="platform"
                label="Platform"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="main_color"
                label="MainColor"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="secondary_color"
                label="SecondaryColor"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="tertiary_color"
                label="TertiaryColor"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="text_color"
                label="TextColor"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              {/* <Form.Item
                name="main_logo"
                label="MainLogo"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="image_bg"
                label="ImageBg"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item> */}
              <Form.Item
                name="backend_version"
                label="BackendVersion"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SettingsGenericConfig;
