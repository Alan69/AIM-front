import React, { useState } from "react";
import {
  Layout,
  Image,
  Button,
  Checkbox,
  Form,
  Input,
  Upload,
  Typography,
  message,
} from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
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
  const { user } = useTypedSelector((state) => state.auth);
  const { isCustomPostCreated } = useTypedSelector((state) => state.post);
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      if (lastFile.type === "image/jpeg" || lastFile.type === "image/png") {
        setFile(lastFile.originFileObj);
      } else {
        message.error(t("content_plan.post_create_form.error_image_format"));
      }
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    const updatedData = {
      ...values,
      picture: file,
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
                    {post?.picture?.includes("no_img") ? (
                      <LoadingOutlined className={styles.loader} />
                    ) : (
                      <Image
                        src={post?.picture}
                        className={styles.picture}
                        alt={t("content_plan.post_create_form.image_alt")}
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
                  name="picture"
                  label={t("content_plan.post_create_form.upload_image")}
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
                      {t("content_plan.post_create_form.select_file")}
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="title"
                  label={t("content_plan.post_create_form.title")}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="main_text"
                  label={t("content_plan.post_create_form.main_text")}
                >
                  <Input.TextArea rows={8} />
                </Form.Item>

                <Form.Item
                  name="hashtags"
                  label={t("content_plan.post_create_form.hashtags")}
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
                    {t("content_plan.post_create_form.create_post")}
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
