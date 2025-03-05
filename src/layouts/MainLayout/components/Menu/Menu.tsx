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
  FileTextOutlined,
  LayoutOutlined,
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
  handleSwitchMenu: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
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
        <Link to="/account/profile/edit" onClick={handleSwitchMenu}>
          <UserInfo />
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={handleSwitchMenu}>
          <OfferInfo />
        </div>
      ),
    },

    {
      key: "4",
      label: (
        <div onClick={handleSwitchMenu}>
          <CurrentCompanyInfo />
        </div>
      ),
    },
    {
      key: "5",
      icon: <BorderOuterOutlined />,
      label: (
        <Link to="/idea-queries" onClick={handleSwitchMenu}>
          {t("menuMain.items.ideas")}
        </Link>
      ),
    },
    {
      key: "6",
      icon: <FormOutlined />,
      label: (
        <Link to="/post-query" onClick={handleSwitchMenu}>
          {t("menuMain.items.posts")}
        </Link>
      ),
    },
    {
      key: "7",
      icon: <FileDoneOutlined />,
      label: (
        <Link to="/scenario-queries" onClick={handleSwitchMenu}>
          {t("menuMain.items.scenarios")}
        </Link>
      ),
    },
    {
      key: "9",
      icon: <FileTextOutlined />,
      label: (
        <Link to="/article-queries" onClick={handleSwitchMenu}>
          {t("menuMain.items.articles")}
        </Link>
      ),
    },
    {
      key: "10",
      icon: <LayoutOutlined />,
      label: (
        <Link to="/design" onClick={handleSwitchMenu}>
          {t("menuMain.items.design")}
        </Link>
      ),
    },
    {
      key: "8",
      icon: <CalendarOutlined />,
      label: (
        <div className={styles.soon}>
          <Link to="/content-plan" onClick={handleSwitchMenu}>
            {t("menuMain.items.contentPlanPage")}
          </Link>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div className={styles.logOutBtn}>
          <Button type="primary" onClick={logOut}>
            {t("menuMain.logout")}
          </Button>
        </div>
      ),
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
          className={styles.customMenu} // Добавляем свой класс
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
