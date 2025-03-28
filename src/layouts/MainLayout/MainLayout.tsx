import { memo, Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Spin, Typography } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import { Footer } from "antd/es/layout/layout";
import { Footer as FooterLanding } from "layouts/UnauthorisedLayout/components/Footer/Footer";
import MenuNav from "./components/Menu/Menu";
import Header from "../UnauthorisedLayout/components/Header/Header";
import styles from "./MainLayout.module.scss";
import { useIsSmallLaptop } from "hooks/media";

const { Text } = Typography;

export const MainLayout = memo(function MainLayout() {
  const location = useLocation();
  const isSmallLaptop = useIsSmallLaptop();

  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        location.pathname === "/home" ||
          location.pathname === "/agreement" ||
          location.pathname === "/privacy-policy" ||
          location.pathname === "/terms-and-conditions"
          ? ""
          : styles.layout
      )}
    >
      {location.pathname === "/home" ||
      location.pathname === "/agreement" ||
      location.pathname === "/privacy-policy" ||
      location.pathname === "/terms-and-conditions" ? (
        <Header />
      ) : (
        <MenuNav isOpen={isOpen} handleSwitchMenu={handleSwitchMenu} />
      )}
      <div
        className={cn(
          location.pathname === "/home" ||
            location.pathname === "/agreement" ||
            location.pathname === "/privacy-policy" ||
            location.pathname === "/terms-and-conditions"
            ? styles.main
            : styles.body
        )}
      >
        {isSmallLaptop ? (
          <div
            className={styles.menuButton}
            onClick={(e) => handleSwitchMenu()}
          >
            {<CaretRightOutlined />}
          </div>
        ) : (
          ""
        )}
        <Suspense fallback={<Spin size="small" />}>
          <Outlet />
        </Suspense>
        {location.pathname === "/home" ||
        location.pathname === "/agreement" ||
        location.pathname === "/privacy-policy" ||
        location.pathname === "/terms-and-conditions" ? (
          <FooterLanding />
        ) : (
          <Footer className={styles.footer}>
            <div className={styles.footerContainer}>
              <Text>
                © Copyright <b>AimMagic.com.</b> All Rights Reserved
              </Text>
              <div className={styles.socialMedias}>
                <a href="https://www.facebook.com/people/AimMagic/61560400936181/">
                  <FacebookOutlined />
                </a>
                <a href="https://www.instagram.com/aimmagic/">
                  <InstagramOutlined />
                </a>
                <a href="https://www.linkedin.com/company/a-gene/">
                  <LinkedinOutlined />
                </a>
              </div>
            </div>
          </Footer>
        )}
      </div>
    </div>
  );
});
