import { useState } from "react";
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
import styles from "./PostCreateForm.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import { TCreatePost, TPostData } from "modules/post/redux/api";

const { Content } = Layout;
const { Title, Text } = Typography;

type TProps = {
  post: TPostData | undefined;
  isCustomPostCreating: boolean;
  handleCreateCustomPost: (updatedData: TCreatePost) => void;
};

export const PostCreateForm = ({
  post,
  isCustomPostCreating,
  handleCreateCustomPost,
}: TProps) => {
  const { isCustomPostCreated } = useTypedSelector((state) => state.post);
  const { t } = useTranslation();

  const [fileList, setFileList] = useState<File[]>([]);

  const handleFileChange = (info: any) => {
    const validTypes = ["image/jpeg", "image/png"];
    const files = info.fileList.map((file: any) => file.originFileObj);

    const isValid = files.every((file: File) => validTypes.includes(file.type));
    if (!isValid) {
      message.error(t("contentPlanPage.post_create_form.error_file_format"));
      return;
    }

    if (files.length > 10) {
      message.error(t("contentPlanPage.post_create_form.error_max_files"));
      return;
    }

    setFileList(files);
  };

  const onFinish = (values: any) => {
    const updatedData = {
      ...values,
      media_files: fileList,
    };
    handleCreateCustomPost(updatedData);
  };

  return (
    <Layout>
      <Content>
        {isCustomPostCreated ? (
          <div className={styles.postDescr}>
            <div className={styles.container}>
              <div className={styles.mainBlock}>
                <div className={styles.postHeader}>
                  <div className={styles.pictureBlock}>
                    {post && post?.previouspostimage?.length > 0 ? (
                      post?.previouspostimage?.map((media) =>
                        media.media.endsWith(".mp4") ||
                        media.media.endsWith(".mov") ? (
                          <video
                            key={media.id}
                            src={media.media}
                            controls
                            className={styles.mediaVideo}
                          />
                        ) : (
                          <Image
                            key={media.id}
                            src={media.media}
                            className={styles.picture}
                            alt={t(
                              "contentPlanPage.post_create_form.image_alt"
                            )}
                          />
                        )
                      )
                    ) : post?.picture?.endsWith(".mp4") ||
                      post?.picture?.endsWith(".mov") ? (
                      <video
                        src={post.picture}
                        controls
                        className={styles.mediaVideo}
                      />
                    ) : (
                      <Image
                        src={post?.picture}
                        className={styles.picture}
                        alt={t("contentPlanPage.post_create_form.image_alt")}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.postContent}>
                  <Title level={3}>{post?.title}</Title>
                  <Text>{post?.main_text}</Text>

                  <div className={styles.postHashtags}>
                    <Text>{post?.hashtags}</Text>
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
                  name="media_files"
                  label={t("contentPlanPage.post_create_form.upload_file")}
                >
                  <Upload
                    name="media_files"
                    listType="picture"
                    accept="image/jpeg, image/png, video/mp4, video/quicktime"
                    multiple
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                  >
                    <Button icon={<UploadOutlined />}>
                      {t("contentPlanPage.post_create_form.select_files")}
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="title"
                  label={t("contentPlanPage.post_create_form.title")}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="main_text"
                  label={t("contentPlanPage.post_create_form.main_text")}
                >
                  <Input.TextArea rows={8} />
                </Form.Item>

                <Form.Item
                  name="hashtags"
                  label={t("contentPlanPage.post_create_form.hashtags")}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isCustomPostCreating}
                    block
                  >
                    {t("contentPlanPage.post_create_form.create_post")}
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
