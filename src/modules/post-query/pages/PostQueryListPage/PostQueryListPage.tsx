import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Layout, Table } from 'antd';
import type { TableProps } from 'antd';
import { TPostQueryData, useGetPostQueriesListQuery } from '../../redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';
import styles from './PostQueryListPage.module.scss'

const { Content } = Layout;

export const PostQueryListPage = () => {
  const { current_company } = useTypedSelector((state) => state.auth);
  const { data: postQueriesList, refetch } = useGetPostQueriesListQuery();

  const columns: TableProps<TPostQueryData>['columns'] = [
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
      fixed: 'left',
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Тип поста',
      dataIndex: 'post_type',
      key: 'post_type',
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Стилистика',
      dataIndex: 'text_style',
      key: 'text_style',
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Дата cоздания',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => (
        <Link to={`/post-query/${record.id}`}>
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
    id: item.id,
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
      <Content className='page-layout'>
        <h1 className='main-title'>История запросов - {current_company?.name}</h1>
        {/* @ts-ignore */}
        <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 'max-content' }} />
      </Content>
    </Layout>
  )
}
