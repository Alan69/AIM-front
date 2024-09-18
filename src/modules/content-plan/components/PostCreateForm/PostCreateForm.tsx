import React, { useEffect, useState } from 'react';
import { Layout, Image, Button, Checkbox, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './PostCreateForm.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useCreatePostMutation } from 'modules/post/redux/api';

const { Content } = Layout;

export const PostCreateForm = () => {
  const { user } = useTypedSelector((state) => state.auth);

  const [createPost, { isLoading: isUpdating }] = useCreatePostMutation();

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (info: any) => {
    const fileList = info.fileList;
    if (fileList.length > 0) {
      const lastFile = fileList[fileList.length - 1];
      setFile(lastFile.originFileObj);
    } else {
      setFile(null);
    }
  };

  const onFinish = (values: any) => {
    console.log(values);

    const updatedData = {
      ...values,
      picture: file
    };

    createPost(updatedData).unwrap().then((response) => {
    });
  };

  return (
    <Layout>
      <Content>
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
                <Upload name="picture" listType="picture" maxCount={1} beforeUpload={() => false} onChange={handleFileChange}>
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

              <Form.Item name="like" valuePropName="checked">
                <Checkbox>Лайк</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isUpdating}>
                  Создать пост
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
    </Layout>
  );
};
