import React, { useEffect, useState } from 'react';
import { Layout, Image, Button, Checkbox, Form, Input, Upload, Typography, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './PostCreateForm.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { TCreatePost, TPostData } from 'modules/post/redux/api';

const { Content } = Layout;
const { Title, Text } = Typography;

type TProps = {
  post: TPostData | undefined
  isCustomPostCreating: boolean;
  handleCreateCustomPost: (updatedData: TCreatePost) => void
}

export const PostCreateForm = ({ post, isCustomPostCreating, handleCreateCustomPost }: TProps) => {
  const { user } = useTypedSelector((state) => state.auth);
  const { isCustomPostCreated } = useTypedSelector((state) => state.post);

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      if (lastFile.type === 'image/jpeg' || lastFile.type === 'image/png') {
        setFile(lastFile.originFileObj);
      } else {
        message.error('Пожалуйста, загрузите файл формата JPEG или PNG');
      }
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    const updatedData = {
      ...values,
      picture: file
    };
    handleCreateCustomPost(updatedData)
  };

  return (
    <Layout>
      <Content>
        {isCustomPostCreated ? <div className={styles.postDescr}>
          <div className={styles.container}>
            <div className={styles.mainBlock}>
              <div className={styles.postHeader}>
                <div className={styles.pictureBlock}>
                  {post?.picture?.includes('no_img') ?
                    <LoadingOutlined className={styles.loader} />
                    :
                    <Image
                      src={post?.picture}
                      className={styles.picture}
                      alt="Post Image"
                    />
                  }
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
          :
          <div className={styles.postDescr}>
            <div className={styles.container}>
              {/* <div className={styles.postHeader}>
                <div className={styles.pictureBlock}>
                  <Image
                    src={post?.picture}
                    className={styles.picture}
                    alt="Post Image"
                  />
                </div>
              </div> */}

              <Form
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item name="picture" label="Загрузить новое изображение">
                  <Upload name="picture" listType="picture" accept="image/jpeg, image/png" maxCount={1} beforeUpload={() => false} onChange={handleFileChange}>
                    <Button icon={<UploadOutlined />}>Выберите файл</Button>
                  </Upload>
                </Form.Item>

                <Form.Item name="title" label="Заголовок">
                  <Input />
                </Form.Item>

                <Form.Item name="main_text" label="Основной текст">
                  <Input.TextArea rows={8} />
                </Form.Item>

                <Form.Item name="hashtags" label="Хэштеги">
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isCustomPostCreating} block>
                    Создать пост
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        }
      </Content>
    </Layout>
  );
};
