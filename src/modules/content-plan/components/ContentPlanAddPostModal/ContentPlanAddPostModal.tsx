import { Modal, Button, DatePicker, TimePicker, Divider, List, Typography, Image } from 'antd';
import { PictureOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
import cn from 'classnames';
import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import styles from './ContentPlanAddPostModal.module.scss';
import { TPostData } from 'modules/post/redux/api';
import { TSocialMediaByCurrentCompanyData } from 'modules/social-media/redux/api';
import { TAddToSchedulersData } from 'modules/content-plan/redux/api';
import { useTypedSelector } from 'hooks/useTypedSelector';

moment.locale('ru');

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleShowContentPlanPostsListModal: () => void;
  handleShowContentPlanSocialMediaListModal: () => void;
  selectNewPost: TPostData | null;
  selectNewSocialMedia: TSocialMediaByCurrentCompanyData | null;
  isAddingToSchedulers: boolean;
  handleAddToSchedulers: (item: TAddToSchedulersData) => void;
  handleClearAddModalParams: () => void;
};

const { Title, Paragraph } = Typography;

export const ContentPlanAddPostModal = ({
  isModalOpen,
  setIsModalOpen,
  handleShowContentPlanPostsListModal,
  handleShowContentPlanSocialMediaListModal,
  selectNewPost,
  selectNewSocialMedia,
  isAddingToSchedulers,
  handleAddToSchedulers,
  handleClearAddModalParams
}: TProps) => {
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
    setSelectedTime(time);
  };

  const handleClearAddModal = () => {
    handleClearAddModalParams();
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleSubmit = () => {
    if (selectedDate && selectedTime && current_company && selectNewPost && selectNewSocialMedia) {
      const scheduledDate = selectedDate.format('YYYY-MM-DD');
      const scheduledTime = selectedTime.format('HH:mm:ss');

      handleAddToSchedulers({
        post_id: selectNewPost.id,
        company_id: current_company.id,
        social_media_account_ids: [selectNewSocialMedia.id],
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        active: true,
      });

      handleClearAddModal();
    }
  };

  const disableHours = () => {
    const currentHour = moment().hour();
    if (selectedDate && selectedDate.isSame(moment(), 'day')) {
      return Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour < currentHour);
    }
    return [];
  };

  const disableMinutes = (selectedHour: number) => {
    const currentMinute = moment().minute();
    if (selectedDate && selectedDate.isSame(moment(), 'day') && selectedHour === moment().hour()) {
      return Array.from({ length: 60 }, (_, i) => i).filter((minute) => minute < currentMinute);
    }
    return [];
  };

  const disableDate = (current: moment.Moment) => {
    return current && current < moment().startOf('day');
  };

  return (
    <Modal
      title="Добавить контент"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => {
        handleClearAddModal();
        setIsModalOpen(false);
      }}
      width={600}
      footer={[
        <Button.Group key="group" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button
            key="submit"
            type="default"
            onClick={() => setIsModalOpen(false)}
            style={{
              borderRadius: '20px 0 0 20px',
              borderRight: '1px solid #d9d9d9',
              width: '33.33%',
            }}
          >
            Опубликовать сейчас
          </Button>
          <Button
            key="schedule"
            type="default"
            onClick={handleSubmit}
            style={{
              borderRight: '1px solid #d9d9d9',
              borderRadius: '0',
              width: '33.33%',
            }}
            disabled={!selectedDate || !selectedTime || !selectNewPost || !selectNewSocialMedia}
            loading={isAddingToSchedulers}
          >
            В планировщик
          </Button>
          <Button
            key="draft"
            type="default"
            onClick={() => setIsModalOpen(false)}
            style={{
              borderRadius: '0 20px 20px 0',
              width: '33.33%',
            }}
          >
            Черновик
          </Button>
        </Button.Group>
      ]}
    >
      <Divider />
      <div className={styles.addBtns}>
        <Button icon={<PictureOutlined />} onClick={handleShowContentPlanPostsListModal}>
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
            className={cn(styles.selectNewPost, styles.selectNewPost__isActive)}
            avatar={<Image width={160} height={160} src={selectNewPost?.picture} />}
            title={<Title level={5}>{selectNewPost?.title}</Title>}
            description={
              <>
                <Paragraph className={styles.text} ellipsis={!expandedKeys ? { rows: 4, expandable: false } : false}>
                  {selectNewPost?.main_text}
                </Paragraph>
                <div className={styles.expandBtn}>
                  <Button type="link" onClick={() => setExpandedKeys(!expandedKeys)}>
                    {expandedKeys ? 'Скрыть' : 'Развернуть'}
                  </Button>
                </div>
              </>
            }
          />
        </List.Item>
      ) : null}

      <Button onClick={handleShowContentPlanSocialMediaListModal} className={styles.socialMediaAddBtn}>
        Добавить социальную сеть
      </Button>

      {selectNewSocialMedia !== null ? (
        <div className={styles.itemList}>
          <div className={cn(styles.selectNewSocialMedia, styles.selectNewSocialMedia__isActive)}>
            <img width={32} height={32} src={selectNewSocialMedia?.platform.icon} alt={selectNewSocialMedia?.username} />
            <Title level={5} className={styles.username}>
              {selectNewSocialMedia?.username}
            </Title>
          </div>
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
          disabledTime={() => ({
            disabledHours: disableHours,
            disabledMinutes: disableMinutes,
          })}
          placeholder="Выберите время"
        />
      </div>
    </Modal>
  );
};
