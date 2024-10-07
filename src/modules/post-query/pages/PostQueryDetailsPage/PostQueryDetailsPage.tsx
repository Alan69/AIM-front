import React, { ReactNode, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useGetPostQueriesByIdQuery } from '../../redux/api';

import { Layout, Table, TableProps, Typography, Checkbox } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styles from './PostQueryDetailsPage.module.scss';
import { TPostData, useGetPostListQuery } from 'modules/post/redux/api';

interface DataType {
  key: string;
  post_name: string;
  post_like: ReactNode;
  time_create?: string;
  post_actions?: ReactNode;
}

const { Title, Text } = Typography;
const { Content } = Layout;

export const PostQueryDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: postQuery, isLoading, refetch } = useGetPostQueriesByIdQuery(id || '');
  const { data: posts } = useGetPostListQuery(postQuery?.id || '')

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Заголовок',
      dataIndex: 'post_name',
      key: 'post_name',
      render: (text, record) => (
        <Link to={`/post/${id}/${record.key}`}>
          {text}
        </Link>
      ),
      fixed: 'left',
    },
    {
      title: 'В избранные для публикации',
      dataIndex: 'post_like',
      key: 'post_like',
    },
    {
      title: 'Дата cоздания',
      dataIndex: 'time_create',
      key: 'time_create',
      render: (text, record) => (
        <Link to={`/post/${id}/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Действия',
      dataIndex: 'post_actions',
      key: 'post_actions',
    },
  ];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Invalid date';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const data: DataType[] = posts?.map((post: TPostData) => ({
    key: post.id.toString(),
    post_name: post.title,
    post_like: <Checkbox checked={post.like}></Checkbox>,
    time_create: formatDate(post.time_create),
    post_actions: (
      <div className={styles.postQueryDescr__icons}>
        <Link to={`/post/${postQuery?.id}/${post?.id}/update`}><EditOutlined /></Link>
        <Link to={`/post/${postQuery?.id}/${post?.id}/delete`}><DeleteOutlined /></Link>
      </div>
    ),
  })) || [];

  useEffect(() => {
    refetch()
  }, [refetch])

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>{(postQuery?.company?.name ? postQuery?.company?.name : '-') + ' - ' + (postQuery?.product?.name ? postQuery?.product?.name : '-')}</h1>
        <Layout>
          <Content>
            <div className={styles.postQueryDescr}>
              <div className={styles.postQueryDescr__title}>
                <Title level={4} >Тип поста: {postQuery?.post_type?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4} >Стилистика: {postQuery?.text_style?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4} >Язык: {postQuery?.lang?.name}</Title>
              </div>
              <div className={styles.postQueryDescr__title}>
                <Title level={4} >Описание: {postQuery?.content}</Title>
              </div>
            </div>
          </Content>
        </Layout>
        <Layout>
          <h2 className={styles.product__title}>
            Посты:
          </h2>
          <Content >
            <div className={styles.postQueryDescr}>
              {!posts?.length ? <div style={{ paddingBottom: '12px' }}>
                <Text >No posts</Text>
              </div> : <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 'max-content' }} />}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
