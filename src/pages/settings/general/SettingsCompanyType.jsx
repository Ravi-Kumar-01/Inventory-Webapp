import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Popconfirm,
  Select,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { SettingsCompanyTypeUrl, BaseUrl } from "../../../utils/network";
import { CRUD, search, customRequest } from "../../../utils/js_functions";
import Loading from "../../../utils/loadingPage";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyTypes } from "../../../redux/slice";
import { formItemLayout } from "../../../../src/utils/data";
import GeneralTable from "../../../components/generalTable/GeneralTable";
import PageLayout from "../../../components/PageLayout";
import {
  defaultColumnSorter,
  numberColumnSorter,
  dateColumnSorter,
} from "../../../components/generalTable/GeneralTableHelper";

import { relative } from "path";

const { Search } = Input;
const { Option } = Select;

const SettingsCompanyType = () => {
  let userPerm = JSON.parse(localStorage.getItem("userPerm"));
  const dispatch = useDispatch();
  let isLoading = useSelector((state) => state.loadingStatus.isLoading);
  let accessCodes = useSelector((state) => state.settings.accessCodes);
  let tableName = SettingsCompanyTypeUrl.split("/")
    .filter((part) => part.length > 0)
    .pop();
  let companyTypes = useSelector((state) => state.settings.companyTypes);
  let persons = useSelector((state) => state.entities.persons);

  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // Table data
  const [pageSize, setPageSize] = useState(10); // Table data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [visible, setVisible] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [form] = Form.useForm(); // Form instance
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);

  //Search
  const refresh = () => {
    setLoading(true);
  };

  //Search
  const onSearch = async (value) => {
    if (value) {
      const timestamp = Date.now();
      const SearchUrl =
        BaseUrl +
        `api/SettingsCompanyType/?timestamp=${timestamp}&search=${value}`;
      let res = await search("get", SearchUrl, null, null);
      dispatch(getCompanyTypes(res));
    } else {
      let res = await CRUD("get", SettingsCompanyTypeUrl, null, null);
      dispatch(getCompanyTypes(res));
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      form.resetFields();
      setIsModalVisible(false);
      if (editingItem) {
        setEditingItem(null);
        let result = await CRUD("put", SettingsCompanyTypeUrl, values, editId);
        if (result) {
          let res = await CRUD("get", SettingsCompanyTypeUrl, null, null);
          dispatch(getCompanyTypes(res));
        } else return result;
      } else {
        let result = await CRUD("post", SettingsCompanyTypeUrl, values, null);
        if (result) {
          let res = await CRUD("get", SettingsCompanyTypeUrl, null, null);
          dispatch(getCompanyTypes(res));
        } else return result;
      }
    });
  };

  const handleDelete = async (record) => {
    let result = await CRUD(
      "delete",
      SettingsCompanyTypeUrl,
      record,
      record.id
    );
    if (result) {
      let res = await CRUD("get", SettingsCompanyTypeUrl, null, null);
      dispatch(getCompanyTypes(res));
    } else return result;
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
    if (loading) {
      let res = await CRUD("get", SettingsCompanyTypeUrl, null, null);
      dispatch(getCompanyTypes(res));
    }
    companyTypes && companyTypes.length > 0
      ? setData(companyTypes)
      : setData([]);
    setLoading(false);
  }, [companyTypes, isLoading, loading]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record, index) => (
        <div>
          {userPerm && userPerm.perm_update_settings === "1" ? (
            <Button
              type="circle"
              style={{
                color: "white",
                background: "green",
              }}
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </Button>
          ) : null}

          {userPerm && userPerm.perm_delete_settings === "1" ? (
            <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="circle"
                style={{
                  color: "white",
                  background: "green",
                }}
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "AccessCode",
      dataIndex: "accessCode",
      key: "accessCode",
      sorter: defaultColumnSorter("accessCode"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = accessCodes.filter((item) => item.id === record.accessCode);
        return res.length > 0 ? res[0].name : "";
      },
    },
    {
      title: "CreatedDateTime",
      dataIndex: "created_datetime",
      key: "created_datetime",
      sorter: dateColumnSorter("created_datetime"),
      sortDirections: ["descend", "ascend"],      
    },
    {
      title: "PersonIdCreatedBy",
      dataIndex: "person_id_createdby",
      key: "person_id_createdby",
      sorter: defaultColumnSorter("person_id_createdby"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = persons.filter(
          (item) => item.id === record.person_id_createdby
        );
        return res.length > 0 ? res[0].user_name : "";
      },
    },
    {
      title: "UpdatedDateTime",
      dataIndex: "updated_datetime",
      sorter: (a, b) =>
        new Date(a.updated_datetime) - new Date(b.updated_datetime),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "PersonIdUpdatedBy",
      dataIndex: "person_id_updatedby",
      key: "person_id_updatedby",
      sorter: defaultColumnSorter("person_id_updatedby"),
      sortDirections: ["descend", "ascend"],
      render: (_, record, index) => {
        let res = persons.filter(
          (item) => item.id === record.person_id_updatedby
        );
        return res.length > 0 ? res[0].user_name : "";
      },
    },
  ];

  const processDataForExcel = () => {
    return data.map((record) => {
      const { status, ...updatedRecord } = record;
      const selAccessCode = accessCodes.find(
        (item) => item.id === record.accessCode
      );
      selAccessCode && (updatedRecord.accessCode = selAccessCode.name);

      let selPersonCreatedBy = persons.find(
        (item) => item.id === record.person_id_createdby
      );
      selPersonCreatedBy &&
        (updatedRecord.person_id_createdby = selPersonCreatedBy.user_name);
      let selPersonUpdatedBy = persons.find(
        (item) => item.id === record.person_id_updatedby
      );
      selPersonUpdatedBy &&
        (updatedRecord.person_id_updatedby = selPersonUpdatedBy.user_name);
      return updatedRecord;
    });
  }
  
  return (
    <>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PageLayout
            title="SettingsReasonsType"
            titleRightAction={() =>
              userPerm &&
              userPerm.perm_create_settings === "1" &&
              userPerm.perm_create_location === "1" ? (
                <Button
                  type="circle"
                  style={{
                    color: "white",
                    background: "green",
                  }}
                  onClick={showModal}
                >
                  <PlusOutlined style={{ size: 20 }} />
                </Button>
              ) : null
            }
          >
            <GeneralTable
              data={data}
              columns={columns}
              onSearch={onSearch}
              onRefresh={refresh}
              onUpload={(options) => customRequest(options, tableName)}
              processDataForExcel={processDataForExcel}
              paperSize="A1"
            />
          </PageLayout>
          <Modal title="Loading Data" open={visible} footer={null}>
            <Loading />
          </Modal>
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
              <Form form={form} {...formItemLayout}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="accessCode"
                  label="AccessCode"
                  rules={[
                    {
                      required: false,
                      message: "Please select an access code",
                    },
                  ]}
                >
                  <Select style={{ width: relative }}>
                    {accessCodes?.map((item, index) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SettingsCompanyType;
