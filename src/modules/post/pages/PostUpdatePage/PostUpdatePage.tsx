import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostByIdQuery, useUpdatePostMutation } from '../../redux/api';
import { Layout, Image, Button, Checkbox, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './PostUpdatePage.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';

const { Content } = Layout;

export const PostUpdatePage = () => {
  const navigate = useNavigate();
  const { user } = useTypedSelector((state) => state.auth);

  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, refetch } = useGetPostByIdQuery(id || '');
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
        picture: file
      };

      updatePost(updatedData).unwrap().then((response) => {
        navigate(`/post/${response.post_query.id}/${response.id}`);
        refetch();
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;


  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
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
                    <div className={styles.postActions}>
                      <Button type="primary" htmlType="submit" loading={isUpdating}>
                        Сохранить
                      </Button>
                      <Button
                        htmlType="button"
                        style={{ color: '#faad14', borderColor: '#faad14' }}
                        onClick={() => navigate(-1)}
                        loading={isUpdating}
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
