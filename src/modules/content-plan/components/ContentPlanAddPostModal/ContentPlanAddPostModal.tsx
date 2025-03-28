import {
  Modal,
  Button,
  DatePicker,
  TimePicker,
  Divider,
  List,
  Typography,
  Image,
  message,
  Space,
  Carousel,
} from "antd";
import {
  PictureOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import cn from "classnames";
import React, { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/ru";
import "moment/locale/en-gb";
import styles from "./ContentPlanAddPostModal.module.scss";
import { TPostData } from "modules/post/redux/api";
import { TSocialMediaByCurrentCompanyData } from "modules/social-media/redux/api";
import { TAddToSchedulersRequest } from "modules/content-plan/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useIsMobile } from "hooks/media";
import { useTranslation } from "react-i18next";
import { TReelData } from "modules/reel/redux/api";
import { ContentPlanPostingType } from "modules/content-plan/types";
import { TStoriesData } from "modules/stories/redux/api";

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleShowContentPlanPostsListModal?: () => void;
  handleShowContentPlanSocialMediaListModal?: () => void;
  handleShowContentPlanReelsModal?: () => void;
  handleShowContentPlanStorieModal?: () => void;
  selectNewPost: TPostData | TReelData | TStoriesData | null | undefined;
  selectedNewSocialMedias: TSocialMediaByCurrentCompanyData[];
  isAddingToSchedulers: boolean;
  handleAddToSchedulers: (item: TAddToSchedulersRequest) => void;
  handleClearAddModalParams: () => void;
  isPostNowLoading: boolean;
  isPostReelNowLoading?: boolean;
  isPostStorieNowLoading?: boolean;
  handlePostNow: () => void;
  isPostPage?: boolean;
  selectedPostType?: ContentPlanPostingType;
};

const { Title, Paragraph } = Typography;

export const ContentPlanAddPostModal = ({
  isModalOpen,
  setIsModalOpen,
  handleShowContentPlanPostsListModal,
  handleShowContentPlanReelsModal,
  handleShowContentPlanStorieModal,
  handleShowContentPlanSocialMediaListModal,
  selectNewPost,
  selectedNewSocialMedias,
  isAddingToSchedulers,
  handleAddToSchedulers,
  handleClearAddModalParams,
  isPostNowLoading,
  isPostReelNowLoading,
  isPostStorieNowLoading,
  handlePostNow,
  isPostPage = false,
  selectedPostType = ContentPlanPostingType.POST,
}: TProps) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedTime, setSelectedTime] = useState<moment.Moment | null>(null);
  const [expandedKeys, setExpandedKeys] = useState(false);

  const handleDateChange = (date: moment.Moment | null) => {
    setSelectedDate(date);
    if (!date) {
      setSelectedTime(null);
    }
  };

  const handleTimeChange = (time: moment.Moment | null) => {
    if (time) {
      const minutes = time.minute();
      if (minutes % 15 !== 0) {
        setSelectedTime(null);
        message.warning(
          t("contentPlanPage.content_plan_add_post_modal.time_invalid")
        );
        return;
      }
    }
    setSelectedTime(time);
  };

  const handleClearAddModal = () => {
    handleClearAddModalParams();
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleSubmit = () => {
    if (
      selectedDate &&
      selectedTime &&
      current_company &&
      selectNewPost &&
      selectedNewSocialMedias.length > 0
    ) {
      const scheduledDate = selectedDate.format("YYYY-MM-DD");
      const scheduledTime = selectedTime.format("HH:mm:ss");

      handleAddToSchedulers({
        post_id:
          selectedPostType === ContentPlanPostingType.POST
            ? selectNewPost?.id
            : undefined,
        reel_id:
          selectedPostType === ContentPlanPostingType.REELS
            ? selectNewPost?.id
            : undefined,
        storie_id:
          selectedPostType === ContentPlanPostingType.STORIES
            ? selectNewPost?.id
            : undefined,
        company_id: current_company.id,
        social_media_account_ids: selectedNewSocialMedias.map(
          (media) => media.id
        ),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        active: true,
        // @ts-ignore
        post_images: selectNewPost.media.length
          ? // @ts-ignore
            selectNewPost.media.map((media) => media.id)
          : undefined,
      });
      handleClearAddModal();
    }
  };

  const disableHours = () => {
    const currentHour = moment().hour();
    if (selectedDate && selectedDate.isSame(moment(), "day")) {
      return Array.from({ length: 24 }, (_, i) => i).filter(
        (hour) => hour < currentHour
      );
    }
    return [];
  };

  const disableMinutes = (selectedHour: number) => {
    const currentMinute = moment().minute();
    const currentHour = moment().hour();

    if (
      selectedDate &&
      selectedDate.isSame(moment(), "day") &&
      selectedHour === currentHour
    ) {
      return Array.from({ length: 60 }, (_, i) => i).filter(
        (minute) => minute <= currentMinute
      );
    }
    return [];
  };

  const disableDate = (current: moment.Moment) => {
    return current && current < moment().startOf("day");
  };

  const renderMediaSlider = () => {
    if (selectNewPost && "media" in selectNewPost && selectNewPost.media) {
      if (Array.isArray(selectNewPost.media)) {
        return (
          <Carousel
            arrows={selectNewPost.media.length > 1}
            dots={selectNewPost.media.length > 1}
            className="mediaSlider"
            style={{
              width: "250px",
              maxWidth: "250px",
              height: "250px",
              overflow: "hidden",
            }}
          >
            {selectNewPost.media.map((mediaItem, index) => {
              const isVideo =
                mediaItem.media.endsWith(".mp4") ||
                mediaItem.media.endsWith(".webm");

              return (
                <div
                  key={index}
                  className="mediaItem"
                  style={{
                    width: "250px",
                    height: "250px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {isVideo ? (
                    <video
                      className="media"
                      controls
                      src={mediaItem.media}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Image
                      src={mediaItem.media}
                      className="media"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt={t(
                        "contentPlanPage.content_plan_add_post_modal.image_alt"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </Carousel>
        );
      } else {
        const mediaItem = selectNewPost;
        const isVideo =
          mediaItem.media.endsWith(".mp4") || mediaItem.media.endsWith(".webm");

        return (
          <div
            className="mediaItem"
            style={{
              width: "250px",
              height: "250px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {isVideo ? (
              <video
                className="media"
                controls
                src={mediaItem.media}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Image
                src={mediaItem.media}
                className="media"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={t("contentPlanPage.content_plan_add_post_modal.image_alt")}
              />
            )}
          </div>
        );
      }
    }
    return null;
  };

  const renderImage = () => {
    const mediaItem = selectNewPost;

    return (
      <div
        className="mediaItem"
        style={{
          width: "250px",
          height: "250px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Image
          // @ts-ignore
          src={mediaItem?.picture}
          className="media"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          alt={t("contentPlanPage.content_plan_add_post_modal.image_alt")}
        />
      </div>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        selectedDate &&
        selectedDate.isSame(moment(), "day") &&
        selectedTime
      ) {
        const now = moment();
        const selectedDateTime = moment(selectedDate).set({
          hour: selectedTime.hour(),
          minute: selectedTime.minute(),
        });

        if (now.isAfter(selectedDateTime)) {
          message.warning(
            t("contentPlanPage.content_plan_add_post_modal.time_passed")
          );
          setSelectedTime(null);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [t,selectedDate, selectedTime]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <Modal
      title={
        isPostPage
          ? t("contentPlanPage.content_plan_add_post_modal.scheduler_title")
          : t("contentPlanPage.content_plan_add_post_modal.add_content_title")
      }
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => {
        handleClearAddModal();
        setIsModalOpen(false);
      }}
      width={600}
      footer={[
        <Button.Group
          key="group"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "4px" : "0",
            marginTop: isMobile ? "40px" : "0",
          }}
        >
          {isPostPage ? (
            ""
          ) : (
            <Button
              key="submit"
              type="default"
              onClick={handlePostNow}
              style={{
                borderRadius: isMobile ? "20px" : "20px 0 0 20px",
                borderRight: "1px solid #d9d9d9",
                width: isMobile ? "100%" : "33.33%",
              }}
              disabled={!selectNewPost || selectedNewSocialMedias.length === 0}
              loading={
                isPostNowLoading ||
                isPostReelNowLoading ||
                isPostStorieNowLoading
              }
            >
              {t("contentPlanPage.content_plan_add_post_modal.publish_now")}
            </Button>
          )}
          <Button
            key="schedule"
            type="default"
            onClick={handleSubmit}
            style={{
              borderRight: isPostPage
                ? "none"
                : isMobile
                  ? "none"
                  : "1px solid #d9d9d9",
              borderRadius: isPostPage ? "20px" : isMobile ? "20px" : "0",
              width: isPostPage ? "100%" : isMobile ? "100%" : "33.33%",
            }}
            disabled={
              !selectedDate ||
              !selectedTime ||
              !selectNewPost ||
              selectedNewSocialMedias.length === 0
            }
            loading={isAddingToSchedulers}
          >
            {t("contentPlanPage.content_plan_add_post_modal.add_to_scheduler")}
          </Button>
          {isPostPage ? (
            ""
          ) : (
            <Button
              key="draft"
              type="default"
              onClick={() => setIsModalOpen(false)}
              style={{
                borderRadius: isMobile ? "20px" : "0 20px 20px 0",
                width: isMobile ? "100%" : "33.33%",
              }}
            >
              {t("contentPlanPage.content_plan_add_post_modal.draft")}
            </Button>
          )}
        </Button.Group>,
      ]}
    >
      {isPostPage ? (
        ""
      ) : (
        <>
          <Divider />
          <div className={styles.addBtns}>
            <Button
              icon={<PictureOutlined />}
              onClick={handleShowContentPlanPostsListModal}
              className={cn(
                styles.addBtn,
                selectedPostType === ContentPlanPostingType.POST
                  ? styles.addBtn__isActive
                  : ""
              )}
            >
              {t("contentPlanPage.content_plan_add_post_modal.post")}
            </Button>
            <Button
              icon={<VideoCameraOutlined />}
              onClick={handleShowContentPlanReelsModal}
              className={cn(
                styles.addBtn,
                selectedPostType === ContentPlanPostingType.REELS
                  ? styles.addBtn__isActive
                  : ""
              )}
            >
              {t("contentPlanPage.content_plan_add_post_modal.reels")}
            </Button>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleShowContentPlanStorieModal}
              className={cn(
                styles.addBtn,
                selectedPostType === ContentPlanPostingType.STORIES
                  ? styles.addBtn__isActive
                  : ""
              )}
            >
              {t("contentPlanPage.content_plan_add_post_modal.stories")}
            </Button>
          </div>
          <Divider />

          {selectNewPost !== null ? (
            <List.Item>
              <List.Item.Meta
                className={cn(
                  styles.selectNewPost,
                  styles.selectNewPost__isActive
                )}
                avatar={
                  // @ts-ignore
                  selectNewPost?.media?.length
                    ? renderMediaSlider()
                    : renderImage()
                }
                description={
                  <>
                    <Paragraph
                      className={styles.text}
                      ellipsis={
                        !expandedKeys ? { rows: 4, expandable: false } : false
                      }
                    >
                      {selectNewPost && "main_text" in selectNewPost
                        ? selectNewPost?.main_text
                        : ""}
                    </Paragraph>
                    <div className={styles.expandBtn}>
                      <Button
                        type="link"
                        onClick={() => setExpandedKeys(!expandedKeys)}
                      >
                        {expandedKeys
                          ? t(
                              "contentPlanPage.content_plan_add_post_modal.hide"
                            )
                          : t(
                              "contentPlanPage.content_plan_add_post_modal.expand"
                            )}
                      </Button>
                    </div>
                  </>
                }
              />
            </List.Item>
          ) : null}
        </>
      )}

      <Button
        onClick={handleShowContentPlanSocialMediaListModal}
        className={styles.socialMediaAddBtn}
      >
        {t("contentPlanPage.content_plan_add_post_modal.add_social_media")}
      </Button>

      {selectedNewSocialMedias.length > 0 ? (
        <div className={styles.itemList}>
          {selectedNewSocialMedias.map((media) => (
            <div
              key={media.id}
              className={cn(
                styles.selectNewSocialMedia,
                styles.selectNewSocialMedia__isActive
              )}
            >
              <img
                width={32}
                height={32}
                src={media.platform.icon}
                alt={media.username}
              />
              <Title level={5} className={styles.username}>
                {media.username}
              </Title>
            </div>
          ))}
        </div>
      ) : null}
      <Space>
        <div className={styles.dateTimeBlock}>
          <DatePicker
            className={styles.datePicker}
            // @ts-ignore
            disabledDate={disableDate}
            onChange={handleDateChange}
            value={selectedDate}
            format="DD-MM-YYYY"
            placeholder={t(
              "contentPlanPage.content_plan_add_post_modal.choose_date"
            )}
          />
          <TimePicker
            className={styles.timePicker}
            // @ts-ignore
            value={selectedTime}
            // @ts-ignore
            onChange={handleTimeChange}
            format="HH:mm"
            minuteStep={15}
            disabled={!selectedDate}
            disabledTime={(current) => {
              const selectedHour = current ? current.hour() : 0;
              return {
                disabledHours: disableHours,
                disabledMinutes: () => disableMinutes(selectedHour),
              };
            }}
            placeholder={t(
              "contentPlanPage.content_plan_add_post_modal.choose_time"
            )}
            showNow={false}
            onOpenChange={(open) => {
              if (open) {
                const selectedHour = selectedTime ? selectedTime.hour() : 0;
                disableMinutes(selectedHour);
              }
            }}
          />
        </div>
      </Space>
    </Modal>
  );
};
