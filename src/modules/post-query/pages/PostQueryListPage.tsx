import React, { useEffect } from 'react'
import { Layout, Table } from 'antd';
import type { TableProps } from 'antd';
import { TPostQueryData, useGetPostQueriesListQuery } from '../redux/api';
import { Link } from 'react-router-dom';
import { useTypedSelector } from 'hooks/useTypedSelector';

const { Content } = Layout;

export const PostQueryListPage = () => {
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: postQueriesList, refetch } = useGetPostQueriesListQuery();

  const columns: TableProps<TPostQueryData>['columns'] = [
    {
      title: 'Компания',
      dataIndex: 'company',
      key: 'company',
      render: (text, record) => (
        // @ts-ignore
        <Link to={`/post-query/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        // @ts-ignore
        <Link to={`/post-query/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Тип поста',
      dataIndex: 'post_type',
      key: 'post_type',
      render: (text, record) => (
        // @ts-ignore
        <Link to={`/post-query/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Стилистика',
      dataIndex: 'text_style',
      key: 'text_style',
      render: (text, record) => (
        // @ts-ignore
        <Link to={`/post-query/${record.key}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        // @ts-ignore
        <Link to={`/post-query/${record.key}`}>
          {text}
        </Link>
      ),
    },
  ];

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

  const data = postQueriesList?.map((item) => ({
    key: item.id,
    company: item?.company?.name,
    product: item?.product?.name,
    post_type: item?.post_type?.name,
    text_style: item?.text_style?.name,
    date: formatDate(item?.time_create),
  }));

  useEffect(() => {
    refetch()
  }, [refetch, current_company])

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 70px)' }}>
        <h1>История запросов</h1>
        {/* @ts-ignore */}
        <Table columns={columns} dataSource={data} pagination={false} />
      </Content>
    </Layout>
  )
}
