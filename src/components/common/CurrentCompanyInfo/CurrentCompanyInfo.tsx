import React from 'react';
import { PlusCircleOutlined, UnorderedListOutlined } from '@ant-design/icons';
import styles from './CurrentCompanyInfo.module.scss';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCompanyListQuery, useUpdateCurrentCompanyMutation } from 'modules/company/redux/api';
import { Dropdown, Space, Menu, Button } from 'antd';
import { useLazyGetAuthUserQuery } from 'modules/auth/redux/api';

const CurrentCompanyInfo: React.FC = () => {
  const navigate = useNavigate()
  const { data: companyList } = useGetCompanyListQuery();
  const [getAuthUser] = useLazyGetAuthUserQuery()

  const [updateCurrentCompany] = useUpdateCurrentCompanyMutation()

  const companyItems = companyList?.map((company) => ({
    key: company.id,
    label: <Button
      type="text"
      onClick={() => {
        navigate(`/company/${company.id}`)
        updateCurrentCompany(company.id).unwrap().then(() => {
          getAuthUser()
        }).catch((err) => {
          console.log(err);
        })
      }}>{company.name}
    </Button>,
  })) || [];

  const { current_company } = useTypedSelector((state) => state.auth);

  const menu = (
    <Menu
      items={[
        ...companyItems,
      ]}
    />
  );

  return (
    <div className={styles.infoBlock}>
      <div className={styles.details}>
        <div className={styles.name}>
          {current_company ? current_company.name : '-'}
        </div>
        <div className={styles.actions}>
          <Dropdown overlay={menu} trigger={['hover']} className={styles.dropdown} placement="bottom">
            <Space>
              <UnorderedListOutlined className={styles.addIcon} />
            </Space>
          </Dropdown>
          <Button
            type="primary"
            shape="circle"
            className={styles.addButton}
            icon={<PlusCircleOutlined className={styles.addIcon} />}
            onClick={() => navigate('/company/create')}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrentCompanyInfo;
