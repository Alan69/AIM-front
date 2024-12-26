import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  DatePicker,
  TimePicker,
  Divider,
  Typography,
  message,
} from "antd";
import moment from "moment";
import "moment/locale/ru";
import "moment/locale/en-gb";
import styles from "./ContentPlanEditPost.module.scss";
import { useTranslation } from "react-i18next";
import { TEditPostFromSchedulersRequest } from "modules/content-plan/redux/api";
import { TPostData } from "modules/post/redux/api";
import { TReelData } from "modules/reel/redux/api";
import { TStoriesData } from "modules/stories/redux/api";

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditPostFromScheduler: (
    payload: TEditPostFromSchedulersRequest
  ) => void;
  selectedPost: TPostData | TReelData | TStoriesData | null | undefined;
};

export const ContentPlanEditPost = ({
  isModalOpen,
  setIsModalOpen,
  handleEditPostFromScheduler,
  selectedPost,
}: TProps) => {
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedTime, setSelectedTime] = useState<moment.Moment | null>(null);

  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const handleDateChange = (date: moment.Moment | null) => {
    console.log("date", date);

    setSelectedDate(date);
    if (!date) {
      setSelectedTime(null);
    }
  };

  const handleTimeChange = (time: moment.Moment | null) => {
    console.log("time", time);

    if (time) {
      const minutes = time.minute();
      if (minutes % 15 !== 0) {
        setSelectedTime(null);
        message.warning(
          t("contentPlanPage.content_plan_edit_post_modal.time_invalid")
        );
        return;
      }
    }
    setSelectedTime(time);
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

  const handleSubmit = () => {
    if (selectedDate && selectedTime && selectedPost) {
      const updatedPayload = {
        scheduler_id: selectedPost.id,
        scheduled_date: selectedDate.format("YYYY-MM-DD"),
        scheduled_time: selectedTime.format("HH:mm:ss"),
      };
      handleEditPostFromScheduler(updatedPayload);
      setIsModalOpen(false);
    } else {
      message.warning(
        t("contentPlanPage.content_plan_edit_post_modal.fill_all")
      );
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      // @ts-ignore
      setCurrentDate(selectedPost?.scheduled_date);
      // @ts-ignore
      setCurrentTime(selectedPost?.scheduled_time);
    }
  }, [isModalOpen, selectedPost]);

  return (
    <Modal
      title={
        t("contentPlanPage.content_plan_edit_post_modal.edit") +
        ` "${
          selectedPost && "title" in selectedPost
            ? selectedPost.title
            : undefined
        }" `
      }
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={[
        <Button
          key="cancel"
          onClick={() => setIsModalOpen(false)}
          style={{ borderRadius: "16px" }}
        >
          {t("contentPlanPage.content_plan_edit_post_modal.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSubmit}
          style={{ borderRadius: "16px" }}
        >
          {t("contentPlanPage.content_plan_edit_post_modal.save")}
        </Button>,
      ]}
      width={600}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <Divider />

      <div className={styles.postDescr}>
        <div className={styles.selectedDateTime}>
          <div className={styles.currentDate}>
            <Typography.Title level={5}>
              Текущая дата для публикации:
            </Typography.Title>
            <Typography.Text>{currentDate}</Typography.Text>
          </div>
          <div className={styles.currentTime}>
            <Typography.Title level={5}>
              Текущее время для публикации:
            </Typography.Title>
            <Typography.Text>{currentTime}</Typography.Text>
          </div>
        </div>

        <Divider />

        <div className={styles.dateTimeBlock}>
          <div className={styles.currentDate}>
            <Typography.Title level={5}>
              Выберите новую дату для публикации:
            </Typography.Title>
            <DatePicker
              className={styles.datePicker}
              // @ts-ignore
              disabledDate={disableDate}
              value={selectedDate}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
              placeholder={t(
                "contentPlanPage.content_plan_edit_post_modal.choose_date"
              )}
            />
          </div>
          <div className={styles.currentTime}>
            <Typography.Title level={5}>
              Выберите новое время для публикации:
            </Typography.Title>
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
                "contentPlanPage.content_plan_edit_post_modal.choose_time"
              )}
              showNow={false}
            />
          </div>
        </div>

        <Divider />
      </div>
    </Modal>
  );
};
