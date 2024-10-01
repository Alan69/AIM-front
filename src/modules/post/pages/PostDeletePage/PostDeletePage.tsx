import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useDeletePostMutation, useGetPostByIdQuery } from '../../redux/api';
import { Layout, Button } from 'antd';
import styles from './PostDeletePage.module.scss';
import Title from 'antd/es/typography/Title';
import { useGetCompanyListQuery } from 'modules/company/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';

const { Content } = Layout;

export const PostDeletePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const { user } = useTypedSelector((state) => state.auth);

  const { data: post } = useGetPostByIdQuery(id || '');
  const [deletePost, { isLoading: isUpdating }] = useDeletePostMutation();
  const { refetch: refetchCompanyList } = useGetCompanyListQuery(user?.profile.id);

  const handleDeletePost = () => {
    if (post) {
      deletePost(post?.id).unwrap().then((response) => {
        navigate(`/post-query/${post?.post_query}`);
        refetchCompanyList();
      });
    }
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Удаление поста</h1>
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
