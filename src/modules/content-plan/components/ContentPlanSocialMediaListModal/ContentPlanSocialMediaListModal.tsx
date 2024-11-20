import React, { useState } from "react";
import { Modal, Button, Divider, Typography } from "antd";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import styles from "./ContentPlanSocialMediaListModal.module.scss";
import { TSocialMediaByCurrentCompanyData } from "modules/social-media/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";

const { Title } = Typography;

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  socialMediaList: TSocialMediaByCurrentCompanyData[] | undefined;
  handleSelectNewSocialMedias: (
    socialMedias: TSocialMediaByCurrentCompanyData[]
  ) => void;
  selectedNewSocialMedias: TSocialMediaByCurrentCompanyData[];
  isPostNow?: boolean;
  isPostNowLoading?: boolean;
  handlePostNow?: () => void;
};

export const ContentPlanSocialMediaListModal = ({
  isModalOpen,
  setIsModalOpen,
  socialMediaList,
  handleSelectNewSocialMedias,
  selectedNewSocialMedias,
  isPostNow = false,
  isPostNowLoading,
  handlePostNow,
}: TProps) => {
  const { t } = useTranslation();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [selectCurrentSocialMedias, setSelectCurrentSocialMedias] = useState<
    TSocialMediaByCurrentCompanyData[]
  >(selectedNewSocialMedias);

  const handleSelectSocialMedia = (item: TSocialMediaByCurrentCompanyData) => {
    if (isPostNow) {
      if (!selectCurrentSocialMedias.some((social) => social.id === item.id)) {
        const updatedSelection = [...selectCurrentSocialMedias, item];
        setSelectCurrentSocialMedias(updatedSelection);
        handleSelectNewSocialMedias(updatedSelection);
      } else {
        const updatedSelection = selectCurrentSocialMedias.filter(
          (social) => social.id !== item.id
        );
        setSelectCurrentSocialMedias(updatedSelection);
        handleSelectNewSocialMedias(updatedSelection);
      }
    } else {
      if (selectCurrentSocialMedias.some((social) => social.id === item.id)) {
        setSelectCurrentSocialMedias(
          selectCurrentSocialMedias.filter((social) => social.id !== item.id)
        );
      } else {
        setSelectCurrentSocialMedias([...selectCurrentSocialMedias, item]);
      }
    }
  };

  const handleSelectAll = () => {
    if (socialMediaList) {
      handleSelectNewSocialMedias(socialMediaList);
      setSelectCurrentSocialMedias(socialMediaList);
      if (!isPostNow) {
        setIsModalOpen(false);
      }
    }
  };

  const handleSelect = () => {
    if (isPostNow) {
      handlePostNow && handlePostNow();
    } else {
      handleSelectNewSocialMedias(selectCurrentSocialMedias);
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      title={t("content_plan.select_social_networks")}
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      width={600}
      footer={[
        <Button
          key="schedule"
          type="default"
          onClick={handleSelect}
          style={{
            borderRadius: "16px",
            width: "100%",
          }}
          disabled={
            isPostNow
              ? isPostNowLoading || selectCurrentSocialMedias.length === 0
              : selectCurrentSocialMedias.length === 0
          }
          loading={isPostNowLoading}
        >
          {isPostNow ? t("content_plan.publish_now") : t("content_plan.select")}
        </Button>,
      ]}
    >
      <Divider />
      <div className={styles.itemList}>
        {socialMediaList?.length ? (
          socialMediaList?.map((item) => (
            <div
              key={item.id}
              className={cn(
                styles.item,
                selectCurrentSocialMedias.some(
                  (social) => social.id === item.id
                )
                  ? styles.item__isActive
                  : ""
              )}
              onClick={() => handleSelectSocialMedia(item)}
            >
              <img
                width={32}
                height={32}
                src={item?.platform.icon}
                alt={item?.username}
              />
              <Title level={5} className={styles.username}>
                {item?.username}
              </Title>
            </div>
          ))
        ) : (
          <div className={styles.noContent}>
            <div className={styles.noContent__text}>
              {t("content_plan.no_social_networks")}
            </div>
            <Link
              to={`/social-media/${current_company?.id}/add`}
              className={styles.noContent__link}
            >
              {t("content_plan.connect_social_network")}
            </Link>
          </div>
        )}
      </div>
      <Divider />
      <Button
        key="schedule"
        type="default"
        onClick={handleSelectAll}
        style={{
          borderRadius: "16px",
          width: "100%",
        }}
        disabled={socialMediaList?.length === 0}
        loading={isPostNowLoading}
      >
        {t("content_plan.select_all")}
      </Button>
    </Modal>
  );
};
