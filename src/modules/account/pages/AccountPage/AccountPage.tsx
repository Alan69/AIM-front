import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateProfilesMutation } from "../../redux/api";
import {
  Layout,
  Button,
  Form,
  Input,
  Upload,
  Select,
  Image,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useGetJobTypesListQuery } from "../../../../redux/api/jobTypes/jobTypesApi";
import { useGetContriesListQuery } from "../../../../redux/api/contries/contriesApi";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useLazyGetAuthUserQuery } from "modules/auth/redux/api";
import avatar from "assets/avatar.png";
import styles from "./AccountPage.module.scss";
import { useTranslation } from "react-i18next";
import { ConfirmationChangesModal } from "modules/account/components/ConfirmationChangesModal/ConfirmationChangesModal";
import _ from "lodash";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";
import VideoInstructionModal from "modules/account/components/VideoInstructionModal/VideoInstructionModal";

type TUpdateProfilesForm = {
  user: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bd_year: number;
  phone_number?: string;
  job?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
  picture?: string | null;
};

const { Content } = Layout;

export const AccountPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useTypedSelector((state) => state.auth);
  const [file, setFile] = useState<File | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextLocation, setNextLocation] = useState<string | null>(null);

  const profileImage = user?.profile.picture
    ? `${user.profile.picture}`
    : avatar;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().pause();
    }
  };

  const [getAuthUser] = useLazyGetAuthUserQuery();
  const [updateProfiles, { isLoading: isUpdating }] =
    useUpdateProfilesMutation();
  const { data: jobTypesList, isLoading: isJobTypesListUpdating } =
    useGetJobTypesListQuery();
  const { data: contriesList, isLoading: isContriesListUpdating } =
    useGetContriesListQuery();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TUpdateProfilesForm>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      bd_year: undefined,
      phone_number: "",
      job: {
        id: "",
        name: "",
      },
      location: {
        id: "",
        name: "",
      },
      picture: "",
    },
  });

  useEffect(() => {
    getAuthUser();
  }, []);

  const formValues = watch();

  const onSubmit = (data: TUpdateProfilesForm) => {
    if (user) {
      const updatedData = {
        ...data,
        picture: file,
        location: data.location,
        job: data.job,
        id: user.profile.id,
      };
      // @ts-ignore

      updateProfiles(updatedData)
        .unwrap()
        .then(() => {
          getAuthUser();
          message.success(t("accountPage.messages.success"));
          setHasChanges(false);
        })
        .catch(() => {
          message.error(t("accountPage.messages.error"));
        });
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmModal(false);
    if (nextLocation) {
      navigate(nextLocation);
    }
    setNextLocation(null);
    setHasChanges(false);
  };

  const handleCancelNavigation = () => {
    setShowConfirmModal(false);
    setNextLocation(null);
  };

  const currentYear = new Date().getFullYear();

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      if (lastFile.type === "image/jpeg" || lastFile.type === "image/png") {
        setFile(lastFile.originFileObj);
      } else {
        message.error(t("accountPage.messages.invalid_file"));
      }
    } else {
      setFile(null);
    }
  };

  useEffect(() => {
    if (user) {
      const initialValues = {
        first_name: user.profile.user.first_name || "",
        last_name: user.profile.user.last_name || "",
        email: user.profile.user.email || "",
        bd_year: user.profile.bd_year,
        phone_number: user.profile.phone_number || "",
        job: {
          id: user.profile.job?.id || "",
          name: user.profile.job?.name || "",
        },
        location: {
          id: user.profile.location?.id || "",
          name: user.profile.location?.name || "",
        },
        picture: user.profile.picture || "",
      };
      reset(initialValues);
      setHasChanges(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const initialValues = {
        first_name: user.profile.user.first_name || "",
        last_name: user.profile.user.last_name || "",
        email: user.profile.user.email || "",
        bd_year: user.profile.bd_year,
        phone_number: user.profile.phone_number || "",
        job: {
          id: user.profile.job?.id || "",
          name: user.profile.job?.name || "",
        },
        location: {
          id: user.profile.location?.id || "",
          name: user.profile.location?.name || "",
        },
        picture: user.profile.picture || "",
      };
      setHasChanges(
        JSON.stringify(initialValues) !== JSON.stringify(formValues)
      );
    }
  }, [formValues, user]);

  useEffect(() => {
    getAuthUser();
  }, []);

  return (
    <>
      <Layout>
        <Content className="page-layout">
          <h1 className="main-title">{t("accountPage.profile")}</h1>
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Form.Item>
              <div className={styles.photo}>
                {user && (
                  <Image
                    width={200}
                    src={profileImage}
                    alt={user.profile.picture ? user.profile.picture : "Аватар"}
                  />
                )}
                <Controller
                  name="picture"
                  control={control}
                  render={({ field }) => (
                    <Upload
                      {...field}
                      accept="image/jpeg, image/png"
                      listType="picture"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleFileChange}
                    >
                      <Button icon={<UploadOutlined />}>
                        {t("accountPage.photo.upload_button")}
                      </Button>
                    </Upload>
                  )}
                />
              </div>
            </Form.Item>

            <Form.Item
              label={t("accountPage.form.email_label")}
              validateStatus={errors.email ? "error" : ""}
              help={errors.email && t("accountPage.form.email_error")}
            >
              <Controller
                name="email"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item label={t("accountPage.form.first_name_label")}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item label={t("accountPage.form.last_name_label")}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label={t("accountPage.form.birth_year_label")}
              validateStatus={errors.bd_year ? "error" : undefined}
              help={errors.bd_year?.message}
            >
              <Controller
                name="bd_year"
                control={control}
                rules={{
                  required: t("accountPage.form.birth_year_error.required"),
                  min: {
                    value: 1964,
                    message: t("accountPage.form.birth_year_error.min"),
                  },
                  max: {
                    value: currentYear,
                    message: t("accountPage.form.birth_year_error.max"),
                  },
                  pattern: {
                    value: /^\d{4}$/,
                    message: t("accountPage.form.birth_year_error.pattern"),
                  },
                }}
                render={({ field }) => <Input {...field} type="number" />}
              />
            </Form.Item>

            <Form.Item
              label={t("accountPage.form.phone_number_label")}
              validateStatus={errors.phone_number ? "error" : ""}
              help={
                errors.phone_number &&
                "Введите корректный номер телефона в формате +7XXXXXXXXXX."
              }
            >
              <Controller
                name="phone_number"
                control={control}
                rules={{
                  required: t("accountPage.form.phone_number_error.required"),
                  pattern: {
                    value: /^\+7\d{10}$/,
                    message: t("accountPage.form.phone_number_error.pattern"),
                  },
                }}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item label={t("accountPage.form.job_label")}>
              <Controller
                name="job.id"
                control={control}
                disabled={isJobTypesListUpdating}
                render={({ field }) => (
                  <Select {...field}>
                    {jobTypesList?.map((job) => (
                      <Select.Option key={job.id} value={job.id}>
                        {job.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item label={t("accountPage.form.country_label")}>
              <Controller
                name="location.id"
                control={control}
                disabled={isContriesListUpdating}
                render={({ field }) => (
                  <Select {...field}>
                    {contriesList?.map((contry) => (
                      <Select.Option key={contry.id} value={contry.id}>
                        {contry.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                {t("accountPage.buttons.save")}
              </Button>
              <Button htmlType="button" style={{ margin: "0 8px" }}>
                {t("accountPage.buttons.change_password")}
              </Button>
            </Form.Item>
          </Form>
        </Content>
      </Layout>
      <VideoInstructionModal
        isModalVisible={isModalVisible}
        onOpen={openModal}
        onClose={closeModal}
        playerRef={playerRef}
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
      <ConfirmationChangesModal
        visible={showConfirmModal}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        title={t("accountPage.confirmation.title")}
        message={t("accountPage.confirmation.message")}
        okText={t("accountPage.confirmation.save")}
        cancelText={t("accountPage.confirmation.cancel")}
      />
    </>
  );
};
