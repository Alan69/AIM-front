import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPostByIdQuery, useUpdatePostMutation } from "../../redux/api";
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
import styles from "./PostUpdatePage.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";

const { Content } = Layout;

export const PostUpdatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, refetch } = useGetPostByIdQuery(id || "");
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

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
        message.error(t("postUpdatePage.invalid_file_type"));
      }
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    if (post) {
      const updatedData = {
        ...values,
        img_prompt: post.img_prompt,
        txt_prompt: post.txt_prompt,
        active: post.active,
        img_style: post.img_style?.id,
        post_query: post.post_query,
        id: id,
        author: user?.profile.id,
        picture: file,
      };

      updatePost(updatedData)
        .unwrap()
        .then((response) => {
          navigate(`/post/${response.post_query.id}/${response.id}`);
          refetch()
            .unwrap()
            .then(() => {
              message.success(t("postUpdatePage.update_success"));
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
                      src={post?.picture}
                      className={styles.picture}
                      alt={t("postUpdatePage.image_alt")}
                    />
                  </div>
                </div>

                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    title: post?.title,
                    main_text: post?.main_text,
                    hashtags: post?.hashtags,
                    like: post?.like,
                  }}
                >
                  <Form.Item
                    name="picture"
                    label={t("postUpdatePage.upload_image")}
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
                        {t("postUpdatePage.select_file")}
                      </Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item name="title" label={t("postUpdatePage.title")}>
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="main_text"
                    label={t("postUpdatePage.main_text")}
                  >
                    <Input.TextArea rows={8} />
                  </Form.Item>

                  <Form.Item
                    name="hashtags"
                    label={t("postUpdatePage.hashtags")}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="like" valuePropName="checked">
                    <Checkbox>{t("postUpdatePage.add_to_favorites")}</Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <div className={styles.postActions}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdating}
                      >
                        {t("postUpdatePage.buttons.save")}
                      </Button>
                      <Button
                        htmlType="button"
                        type="default"
                        onClick={() => navigate(-1)}
                        loading={isUpdating}
                      >
                        {t("postUpdatePage.buttons.cancel")}
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
