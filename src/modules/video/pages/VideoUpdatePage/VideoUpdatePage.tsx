import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetVideoByIdQuery, useUpdateVideoMutation } from "../../redux/api";
import {
  Layout,
  Image,
  Button,
  Checkbox,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./VideoUpdatePage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";

const { Content } = Layout;

export const VideoUpdatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const { id } = useParams<{ id: string }>();
  const { data: video, isLoading, refetch } = useGetVideoByIdQuery(id || "");
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      if (lastFile.type === "image/jpeg" || lastFile.type === "image/png") {
        setFile(lastFile.originFileObj);
      } else {
        message.error(t("videoUpdatePage.invalid_file_type"));
      }
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    if (video) {
      const updatedData = {
        ...values,
        img_prompt: video.img_prompt,
        txt_prompt: video.txt_prompt,
        active: video.active,
        img_style: video.img_style?.id,
        video_query: video.video_query,
        id: id,
        author: user?.profile.id,
        picture: file,
      };

      updateVideo(updatedData)
        .unwrap()
        .then((response) => {
          navigate(`/video/${response.video_query.id}/${response.id}`);
          refetch()
            .unwrap()
            .then(() => {
              message.success(t("videoUpdatePage.update_success"));
            });
        });
    }
  };

  if (isLoading) return <div>{t("common.loading")}</div>;

  return (
    <Layout>
      <Content className="page-layout">
        <Layout>
          <Content>
            <div className={styles.postDescr}>
              <div className={styles.container}>
                <div className={styles.postHeader}>
                  <div className={styles.pictureBlock}>
                    <Image
                      src={video?.cover}
                      className={styles.picture}
                      alt={t("videoUpdatePage.image_alt")}
                    />
                  </div>
                </div>

                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    title: video?.title,
                    main_text: video?.main_text,
                    hashtags: video?.hashtags,
                    like: video?.like,
                  }}
                >
                  <Form.Item
                    name="picture"
                    label={t("videoUpdatePage.upload_image")}
                  >
                    <Upload
                      name="picture"
                      listType="picture"
                      accept="image/jpeg, image/png"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleFileChange}
                    >
                      <Button icon={<UploadOutlined />}>
                        {t("videoUpdatePage.select_file")}
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item name="title" label={t("videoUpdatePage.title")}>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="main_text"
                    label={t("videoUpdatePage.main_text")}
                  >
                    <Input.TextArea rows={8} />
                  </Form.Item>

                  <Form.Item
                    name="hashtags"
                    label={t("videoUpdatePage.hashtags")}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="like" valuePropName="checked">
                    <Checkbox>{t("videoUpdatePage.add_to_favorites")}</Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <div className={styles.postActions}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdating}
                      >
                        {t("videoUpdatePage.buttons.save")}
                      </Button>
                      <Button
                        htmlType="button"
                        type="default"
                        onClick={() => navigate(-1)}
                        loading={isUpdating}
                      >
                        {t("videoUpdatePage.buttons.cancel")}
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
