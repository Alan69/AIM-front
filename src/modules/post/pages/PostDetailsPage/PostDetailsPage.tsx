import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPostByIdQuery } from '../../redux/api';
import { Layout, Typography, Image, Button, Collapse, Checkbox } from 'antd';

import styles from './PostDetailsPage.module.scss';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export const PostDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: post, error, isLoading, refetch } = useGetPostByIdQuery(id || '');

  const { Content } = Layout;

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

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
                      // width={200}
                      src={post?.picture}
                      className={styles.picture}
                      alt="Post Image"
                    />
                  </div>

                  {/* <Collapse className={styles.postDescription}>
                    <Panel header="Описание" key="1">
                      <Text>{post?.img_prompt}</Text>
                    </Panel>
                  </Collapse> */}
                </div>


                <div className={styles.postContent}>
                  <Title level={3}>{post?.title}</Title>
                  <Text>{post?.main_text}</Text>

                  <div className={styles.postHashtags}>
                    <Text>{post?.hashtags}</Text>
                  </div>
                </div>

                <div className={styles.postLike}>
                  <Text>Лайк</Text>
                  <Checkbox checked={post?.like}></Checkbox>
                </div>

                <div className={styles.postActions}>
                  <Button type="primary" onClick={() => navigate(`/post/${post?.post_query}/${post?.id}/update`)}>
                    Редактировать
                  </Button>
                  <Button htmlType="button" style={{ color: '#faad14', borderColor: '#faad14' }} onClick={() => navigate(-1)}>
                    Отменить
                  </Button>
                </div>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
