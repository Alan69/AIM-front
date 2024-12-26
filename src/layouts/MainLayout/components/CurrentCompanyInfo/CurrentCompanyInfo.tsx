import React from "react";
import { PlusCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import styles from "./CurrentCompanyInfo.module.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useNavigate } from "react-router-dom";
import {
  useGetCompanyListQuery,
  useUpdateCurrentCompanyMutation,
} from "modules/company/redux/api";
import {
  Dropdown,
  Space,
  Menu,
  Button,
  Divider,
  Typography,
  Tooltip,
} from "antd";
import { useLazyGetAuthUserQuery } from "modules/auth/redux/api";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const CurrentCompanyInfo = () => {
  const navigate = useNavigate();
  const { current_company, user } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();
  const { data: companyList } = useGetCompanyListQuery(user?.profile.id);
  const [getAuthUser] = useLazyGetAuthUserQuery();
  const [updateCurrentCompany] = useUpdateCurrentCompanyMutation();

  const companyItems =
    companyList?.map((company) => ({
      key: company.id,
      label: (
        <Button
          type="text"
          className={styles.companyBtn}
          onClick={(e) => {
            updateCurrentCompany(company.id)
              .unwrap()
              .then(() => {
                getAuthUser();
              })
              .catch((err) => {
                console.log(err);
              });
            e.stopPropagation();
          }}
        >
          {company.name}
        </Button>
      ),
    })) || [];

  const menu = <Menu items={[...companyItems]} />;

  return (
    <>
      <div className={styles.upperDivider}>
        <Text className={styles.dividerText}>
          {t("currentCompanyInfo.current_company")}
        </Text>
        <Divider className={styles.divider} />
      </div>
      <div className={styles.infoBlock}>
        <div className={styles.details}>
          <div
            className={styles.name}
            onClick={() =>
              navigate(
                `/company/${current_company?.id ? current_company?.id : "create"}`
              )
            }
          >
            {current_company?.name ? (
              current_company.name
            ) : (
              <span>{t("currentCompanyInfo.add_company")}</span>
            )}
          </div>
          <div className={styles.actions}>
            {current_company ? (
              <Tooltip title={t("currentCompanyInfo.company_list")}>
                <Dropdown
                  overlay={menu}
                  trigger={["click"]}
                  className={styles.dropdown}
                  placement="bottom"
                >
                  <Space>
                    <UnorderedListOutlined className={styles.addIcon} />
                  </Space>
                </Dropdown>
              </Tooltip>
            ) : (
              ""
            )}
            <Tooltip title={t("currentCompanyInfo.add_new_company")}>
              <Button
                type="primary"
                shape="circle"
                className={styles.addButton}
                icon={<PlusCircleOutlined className={styles.addIcon} />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/company/create");
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      <Divider className={styles.divider} />
    </>
  );
};

export default CurrentCompanyInfo;
