import React, { ReactNode, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useGetPostQueriesByIdQuery } from '../../redux/api';

import { Layout, Table, TableProps, Typography, Checkbox } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import styles from './PostQueryDetailsPage.module.scss';
import { useGetProductListByCompanyIdQuery } from '../../../product/redux/api';
import { TPostData, useGetPostListQuery } from 'modules/post/redux/api';

interface DataType {
  key: string;
  post_name: string;
  post_like: ReactNode;
  post_date?: string;
  post_actions?: ReactNode;
}

const { Title, Text } = Typography;

export const PostQueryDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: postQuery, error, isLoading, refetch } = useGetPostQueriesByIdQuery(id || '');
  // @ts-ignore
  const { data: productListByCompanyId } = useGetProductListByCompanyIdQuery(postQuery?.id || '');

  const { data: posts } = useGetPostListQuery()

  const { Content } = Layout;

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
    },
    {
      title: 'Лайк',
      dataIndex: 'post_like',
      key: 'post_like',
    },
    {
      title: 'Дата',
      dataIndex: 'post_date',
      key: 'post_date',
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

  // const data: DataType[] = productListByCompanyId?.map((post: TProductData) => ({
  //   key: post.id.toString(),
  //   product_name: post.name,
  //   product_assignment: post.scope,
  //   product_action: (
  //     <div className={styles.companyDescr__icons}>
  //       <Link to={`/post/${postQuery?.id}/${post?.id}/update`}><EditOutlined /></Link>
  //       <Link to={`/post/${postQuery?.id}/${post?.id}/delete`}><DeleteOutlined /></Link>
  //     </div>
  //   ),
  // })) || [];

  const formatDate = (dateString: string | undefined) => {
    const date = new Date(dateString ? dateString : '');
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
    post_date: formatDate(post.time_update),
    post_actions: (
      <div className={styles.postQueryDescr__icons}>
        <Link to={`/post/${postQuery?.id}/${post?.id}/update`}><EditOutlined /></Link>
        <Link to={`/post/${postQuery?.id}/${post?.id}/delete`}><DeleteOutlined /></Link>
      </div>
    ),
  })) || [];

  useEffect(() => {
    refetch()
  }, [])

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>{postQuery?.company?.name + ' - ' + postQuery?.product?.name}</h1>
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
              {!productListByCompanyId?.length ? <div style={{ paddingBottom: '12px' }}>
                <Text >No posts</Text>
              </div> : ''}
              <Table columns={columns} dataSource={data} pagination={false} />
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
