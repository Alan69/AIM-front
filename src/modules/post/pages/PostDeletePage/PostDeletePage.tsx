import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useDeletePostMutation, useGetPostByIdQuery } from '../../redux/api';
import { Layout, Button } from 'antd';
import styles from './PostDeletePage.module.scss';
import Title from 'antd/es/typography/Title';
import { useGetCompanyListQuery } from 'modules/company/redux/api';

export const PostDeletePage = () => {
  const { Content } = Layout;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const { data: post, error, isLoading, refetch } = useGetPostByIdQuery(id || '');

  const [deletePost, { isLoading: isUpdating }] = useDeletePostMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery();

  const handleDeletePost = () => {
    if (post) {
      deletePost(post?.id).unwrap().then((response) => {
        navigate(`/post-query/${post?.post_query}`);
        // refetchCompanyList();
      });
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>Удаление поста</h1>
        <Layout>
          <Content>
            <div className={styles.companyDescr}>
              <Title level={4} >Вы подтверждаете удаление продукта "{post?.title}"?</Title>
              <div className={styles.buttons}>
                <Button
                  type="primary"
                  danger
                  loading={isUpdating}
                  onClick={handleDeletePost}
                >
                  Удалить
                </Button>
                <Button
                  type="default"
                  style={{ color: '#faad14', borderColor: '#faad14' }}
                  onClick={() => {
                    navigate(`/post-query/${post?.post_query}`)
                  }}
                  loading={isUpdating}>
                  Отмена
                </Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
