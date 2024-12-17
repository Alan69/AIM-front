import React, { useState } from "react";
import { Layout, Image, Button, Form, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./StoriesCreateForm.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import { TCreateStoriesRequest, TStoriesData } from "modules/stories/redux/api";

const { Content } = Layout;

type TProps = {
  storie: TStoriesData | undefined;
  isCustomStoriesCreating: boolean;
  handleCreateCustomStories: (updatedData: TCreateStoriesRequest) => void;
};

export const StoriesCreateForm = ({
  storie,
  isCustomStoriesCreating,
  handleCreateCustomStories,
}: TProps) => {
  const { isCustomStoriesCreated } = useTypedSelector((state) => state.storie);
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const validateMedia = (file: File) => {
    const isImage = ["image/jpeg", "image/png"].includes(file.type);
    const isVideo = ["video/mp4", "video/quicktime"].includes(file.type);

    if (isImage) {
      if (file.size / 1024 / 1024 > 8) {
        message.error(t("content_plan.stories_create_form.error_image_size"));
        return false;
      }
      return true;
    }

    if (isVideo) {
      if (file.size / 1024 / 1024 > 100) {
        message.error(t("content_plan.stories_create_form.error_video_size"));
        return false;
      }
      return true;
    }

    message.error(t("content_plan.stories_create_form.error_file_format"));
    return false;
  };

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1].originFileObj;
      if (validateMedia(lastFile)) {
        setFile(lastFile);
      } else {
        setFile(null);
      }
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    const updatedData = {
      ...values,
      media: file,
    };
    handleCreateCustomStories(updatedData);
  };

  return (
    <Layout>
      <Content>
        {isCustomStoriesCreated ? (
          <div className={styles.postDescr}>
            <div className={styles.container}>
              <div className={styles.mainBlock}>
                <div className={styles.mediaVideos}>
                  {(storie?.media && storie.media.endsWith(".mp4")) ||
                  storie?.media.endsWith(".mov") ? (
                    <video
                      src={storie?.media}
                      controls
                      className={styles.mediaVideo}
                    />
                  ) : (
                    <Image
                      src={storie?.media}
                      alt={t("content_plan.stories_create_form.image_alt")}
                      className={styles.mediaImage}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.postDescr}>
            <div className={styles.container}>
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  name="media"
                  label={t("content_plan.stories_create_form.upload_image")}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "content_plan.stories_create_form.validation_video_required"
                      ),
                    },
                  ]}
                >
                  <Upload
                    name="media"
                    listType="picture"
                    accept="image/jpeg, image/png, video/mp4, video/quicktime"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("content_plan.stories_create_form.select_file")}
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCustomStoriesCreating}
                    block
                  >
                    {t("content_plan.stories_create_form.create_stories")}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};
