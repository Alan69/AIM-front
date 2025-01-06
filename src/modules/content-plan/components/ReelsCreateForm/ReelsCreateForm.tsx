import React, { useState } from "react";
import {
  Layout,
  Image,
  Button,
  Form,
  Input,
  Upload,
  Typography,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./ReelsCreateForm.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import { TCreateReelRequest, TReelData } from "modules/reel/redux/api";

const { Content } = Layout;
const { Title, Text } = Typography;

type TProps = {
  reel: TReelData | undefined;
  isCustomReelCreating: boolean;
  handleCreateCustomReel: (updatedData: TCreateReelRequest) => void;
};

export const ReelsCreateForm = ({
  reel,
  isCustomReelCreating,
  handleCreateCustomReel,
}: TProps) => {
  const { isCustomReelCreated } = useTypedSelector((state) => state.reel);
  const { t } = useTranslation();

  const [fileList, setFileList] = useState<File[]>([]);
  const handleFileChange = (info: any) => {
    const validTypes = ["video/mp4", "video/quicktime"];
    const files = info.fileList.map((file: any) => file.originFileObj);

    const isValid = files.every((file: File) => {
      const isTypeValid = validTypes.includes(file.type);
      const isSizeValid = file.size / 1024 / 1024 < 100;

      if (!isTypeValid) {
        message.error(t("contentPlanPage.reel_create_form.error_file_format"));
        return false;
      }

      if (!isSizeValid) {
        message.error(t("contentPlanPage.reel_create_form.error_file_size"));
        return false;
      }
      return true;
    });

    if (!isValid) return;

    if (files.length > 10) {
      message.error(t("contentPlanPage.reel_create_form.error_max_files"));
      return;
    }

    setFileList(files);
  };

  const onFinish = (values: any) => {
    const updatedData = {
      ...values,
      media: fileList,
    };
    handleCreateCustomReel(updatedData);
  };

  return (
    <Layout>
      <Content>
        {isCustomReelCreated ? (
          <div className={styles.postDescr}>
            <div className={styles.container}>
              <div className={styles.mainBlock}>
                <div className={styles.mediaVideos}>
                  {reel?.reelMediaList?.map((mediaItem) => {
                    if (
                      mediaItem.media.endsWith(".mp4") ||
                      mediaItem.media.endsWith(".mov")
                    ) {
                      return (
                        <div>
                          <video
                            key={mediaItem.id}
                            src={mediaItem.media}
                            controls
                            className={styles.mediaVideo}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <Image
                          key={mediaItem.id}
                          src={mediaItem.media}
                          alt={t("contentPlanPage.reel_create_form.image_alt")}
                          className={styles.mediaImage}
                        />
                      );
                    }
                  })}
                </div>

                <div className={styles.postContent}>
                  <Title level={3}>{reel?.title}</Title>
                  <Text>{reel?.main_text}</Text>

                  <div className={styles.postHashtags}>
                    <Text>{reel?.hashtags}</Text>
                  </div>
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
                  label={t("contentPlanPage.reel_create_form.upload_image")}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "contentPlanPage.reel_create_form.validation_video_required"
                      ),
                    },
                  ]}
                >
                  <Upload
                    name="media"
                    listType="picture"
                    accept="video/mp4, video/quicktime"
                    multiple
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("contentPlanPage.reel_create_form.select_files")}
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="title"
                  label={t("contentPlanPage.reel_create_form.title")}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "contentPlanPage.reel_create_form.validation_title_required"
                      ),
                    },
                    {
                      min: 3,
                      message: t(
                        "contentPlanPage.reel_create_form.validation_title_length"
                      ),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="main_text"
                  label={t("contentPlanPage.reel_create_form.main_text")}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "contentPlanPage.reel_create_form.validation_main_text_required"
                      ),
                    },
                  ]}
                >
                  <Input.TextArea rows={8} />
                </Form.Item>

                <Form.Item
                  name="hashtags"
                  label={t("contentPlanPage.reel_create_form.hashtags")}
                  rules={[
                    {
                      required: true,
                      message: t(
                        "contentPlanPage.reel_create_form.validation_hashtags_required"
                      ),
                    },
                  ]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCustomReelCreating}
                    block
                  >
                    {t("contentPlanPage.reel_create_form.create_reel")}
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
