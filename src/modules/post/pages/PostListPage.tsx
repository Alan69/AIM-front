import React from 'react'
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';

import { Layout } from 'antd';
import { useGetPostListQuery } from '../redux/api';

const { Content } = Layout;

interface DataType {
  key: string;
  company: string;
  product: number;
  post_type: string;
  post_text: string;
  date: string
}

export const PostListPage = () => {
  const { data: postList } = useGetPostListQuery();
  console.log(postList);

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Компания',
      dataIndex: 'company',
      key: 'company',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Тип поста',
      dataIndex: 'post_type',
      key: 'post_type',
    },
    {
      title: 'Стилистика',
      dataIndex: 'post_text',
      key: 'post_text',
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      company: 'John Brown',
      product: 32,
      post_type: 'New York No. 1 Lake Park',
      post_text: 'New York No. 1 Lake Park',
      date: '678'
    },
    {
      key: '2',
      company: 'Jim Green',
      product: 42,
      post_type: 'New York No. 1 Lake Park',
      post_text: 'London No. 1 Lake Park',
      date: '678'
    },
    {
      key: '3',
      company: 'Joe Black',
      product: 32,
      post_type: 'New York No. 1 Lake Park',
      post_text: 'Sydney No. 1 Lake Park',
      date: '678'
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        <h1>История запросов</h1>
        <Table columns={columns} dataSource={data} pagination={false} />
      </Content>
    </Layout>
  )
}
