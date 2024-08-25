import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostByIdQuery } from '../../redux/api';
import { Layout, Image, Button, Checkbox, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './PostUpdatePage.module.scss';

export const PostUpdatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: post, error, isLoading, refetch } = useGetPostByIdQuery(id || '');

  const { Content } = Layout;

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  const onFinish = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <Layout>
          <Content>
            <div className={styles.postDescr}>
              <div className={styles.container}>
                <div className={styles.postHeader}>
                  <div className={styles.pictureBlock}>
                    <Image
                      src={post?.picture}
                      className={styles.picture}
                      alt="Post Image"
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
                  <Form.Item name="picture" label="Загрузить новое изображение">
                    <Upload name="picture" listType="picture" maxCount={1} beforeUpload={() => false}>
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
                    <div className={styles.postActions}>
                      <Button type="primary" htmlType="submit">
                        Сохранить
                      </Button>
                      <Button
                        htmlType="button"
                        style={{ color: '#faad14', borderColor: '#faad14' }}
                        onClick={() => navigate(-1)}
                      >
                        Отменить
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
