import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FormOutlined,
  CalendarOutlined,
  CaretLeftOutlined,
  StockOutlined,
  WechatOutlined,
  FundOutlined,
  RadarChartOutlined,
  BorderOuterOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { Badge, Button, Menu } from "antd";
import type { MenuProps } from "antd";
import cn from "classnames";
import { authActions } from "modules/auth/redux/slices/auth.slice";
import UserInfo from "../UserInfo/Userinfo";
import OfferInfo from "../OfferInfo/OfferInfo";
import CurrentCompanyInfo from "../CurrentCompanyInfo/CurrentCompanyInfo";
import { ReactComponent as IconLogo } from "assets/logo.svg";
import styles from "./Menu.module.scss";
import { useIsSmallLaptop } from "hooks/media";
import { useTranslation } from "react-i18next";

type MenuItem = Required<MenuProps>["items"][number];

type TProps = {
  isOpen: boolean;
  handleSwitchMenu: (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const MenuNav = ({ isOpen, handleSwitchMenu }: TProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isSmallLaptop = useIsSmallLaptop();
  const { t } = useTranslation();

  const logOut = () => {
    dispatch(authActions.logOut());
    navigate("/login", { replace: true });
  };

  const items: MenuItem[] = [
    {
      key: "1",
      label: (
        <Link to="/account/profile/edit">
          <UserInfo />
        </Link>
      ),
    },
    {
      key: "2",
      label: <OfferInfo />,
    },
    {
      key: "3",
      label: (
        <div className={styles.logOutBtn}>
          <Button type="primary" onClick={logOut}>
            {t("menu.logout")}
          </Button>
        </div>
      ),
    },
    {
      key: "4",
      label: <CurrentCompanyInfo />,
    },
    {
      key: "5",
      icon: <BorderOuterOutlined />,
      label: <Link to="/idea-queries">{t("menu.items.ideas")}</Link>,
    },
    {
      key: "6",
      icon: <FormOutlined />,
      label: <Link to="/post-query">{t("menu.items.posts")}</Link>,
    },
    {
      key: "7",
      icon: <FileDoneOutlined />,
      label: <Link to="/scenario-queries">{t("menu.items.scenarios")}</Link>,
    },
    {
      key: "8",
      icon: <CalendarOutlined />,
      label: (
        <div className={styles.soon}>
          <Link to="/content-plan">{t("menu.items.content_plan")}</Link>
          {/* <Badge count={t("menu.soon")} /> */}
        </div>
      ),
    },
    {
      key: "9",
      icon: <StockOutlined />,
      label: (
        <div className={styles.soon}>
          {t("menu.items.marketing_strategy")}
          <Badge count={t("menu.soon")} />
        </div>
      ),
      disabled: true,
    },
    {
      key: "10",
      icon: <FundOutlined />,
      label: (
        <div className={styles.soon}>
          {t("menu.items.sales_funnel")}
          <Badge count={t("menu.soon")} />
        </div>
      ),
      disabled: true,
    },
    {
      key: "11",
      icon: <WechatOutlined />,
      label: (
        <div className={styles.soon}>
          {t("menu.items.chat_hub")}
          <Badge count={t("menu.soon")} />
        </div>
      ),
      disabled: true,
    },
    {
      key: "12",
      icon: <RadarChartOutlined />,
      label: (
        <div className={styles.soon}>
          {t("menu.items.analytics")}
          <Badge count={t("menu.soon")} />
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <div
      className={cn(styles.menuLayout, isOpen ? styles.menuLayout__isOpen : "")}
      onClick={handleSwitchMenu}
    >
      <div
        className={cn(styles.menuBody, isOpen ? styles.menuBody__isOpen : "")}
        onClick={(e) => e.stopPropagation()}
      >
        {isSmallLaptop ? (
          <div className={styles.menuButton} onClick={handleSwitchMenu}>
            {<CaretLeftOutlined />}
          </div>
        ) : (
          ""
        )}
        <Link className={styles.logo} to={"/home"}>
          <IconLogo />
        </Link>
        <Menu
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          mode="inline"
          theme="light"
          items={items}
          style={{ borderColor: "transparent" }}
        />
      </div>
    </div>
  );
};

export default MenuNav;
