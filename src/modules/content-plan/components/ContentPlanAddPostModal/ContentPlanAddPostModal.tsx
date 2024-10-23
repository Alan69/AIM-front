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
import styles from "./ContentPlanAddPostModal.module.scss";
import { TPostData } from "modules/post/redux/api";
import { TSocialMediaByCurrentCompanyData } from "modules/social-media/redux/api";
import { TAddToSchedulersData } from "modules/content-plan/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useIsMobile } from "hooks/media";

moment.locale("ru");

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleShowContentPlanPostsListModal?: () => void;
  handleShowContentPlanSocialMediaListModal: () => void;
  selectNewPost: TPostData | null | undefined;
  selectedNewSocialMedias: TSocialMediaByCurrentCompanyData[];
  isAddingToSchedulers: boolean;
  handleAddToSchedulers: (item: TAddToSchedulersData) => void;
  handleClearAddModalParams: () => void;
  isPostNowLoading: boolean;
  handlePostNow: () => void;
  isPostPage?: boolean;
};

const { Title, Paragraph } = Typography;

export const ContentPlanAddPostModal = ({
  isModalOpen,
  setIsModalOpen,
  handleShowContentPlanPostsListModal,
  handleShowContentPlanSocialMediaListModal,
  selectNewPost,
  selectedNewSocialMedias,
  isAddingToSchedulers,
  handleAddToSchedulers,
  handleClearAddModalParams,
  isPostNowLoading,
  handlePostNow,
  isPostPage = false,
}: TProps) => {
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
        message.warning("Минуты должны быть кратны 15. Выберите другое время.");
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
        post_id: selectNewPost.id,
        company_id: current_company.id,
        social_media_account_ids: selectedNewSocialMedias.map(
          (media) => media.id
        ),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        active: true,
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
          message.warning("Выбранное время прошло, сбрасываем выбор времени.");
          setSelectedTime(null);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  return (
    <Modal
      title={isPostPage ? "Добавление в планировщик" : "Добавить контент"}
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
              loading={isPostNowLoading}
            >
              Опубликовать сейчас
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
            В планировщик
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
              Черновик
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
                selectNewPost?.id ? styles.addBtn__isActive : ""
              )}
            >
              Пост
            </Button>
            <Button icon={<VideoCameraOutlined />} disabled>
              Reels
            </Button>
            <Button icon={<PlayCircleOutlined />} disabled>
              Stories
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
                  <Image
                    width={160}
                    height={160}
                    src={selectNewPost?.picture}
                  />
                }
                title={<Title level={5}>{selectNewPost?.title}</Title>}
                description={
                  <>
                    <Paragraph
                      className={styles.text}
                      ellipsis={
                        !expandedKeys ? { rows: 4, expandable: false } : false
                      }
                    >
                      {selectNewPost?.main_text}
                    </Paragraph>
                    <div className={styles.expandBtn}>
                      <Button
                        type="link"
                        onClick={() => setExpandedKeys(!expandedKeys)}
                      >
                        {expandedKeys ? "Скрыть" : "Развернуть"}
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
        Добавить социальную сеть
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

      <div className={styles.dateTimeBlock}>
        <DatePicker
          className={styles.datePicker}
          // @ts-ignore
          disabledDate={disableDate}
          onChange={handleDateChange}
          value={selectedDate}
          format="DD-MM-YYYY"
          placeholder="Выберите дату"
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
          placeholder="Выберите время"
          showNow={false}
          onOpenChange={(open) => {
            if (open) {
              const selectedHour = selectedTime ? selectedTime.hour() : 0;
              disableMinutes(selectedHour);
            }
          }}
        />
      </div>
    </Modal>
  );
};
