import { Modal, Button, DatePicker, TimePicker, Divider } from 'antd';
import {
  PictureOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/ru';
import styles from './ContentPlanAddPostModal.module.scss'
import { TPostData } from 'modules/post/redux/api';

moment.locale('ru');

type TProps = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleShowContentPlanPostsListModal: () => void
  selectNewPost: TPostData | null
};

export const ContentPlanAddPostModal = ({ isModalOpen, setIsModalOpen, handleShowContentPlanPostsListModal, selectNewPost }: TProps) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedTime, setSelectedTime] = useState<moment.Moment | null>(null);

  const handleDatePickerSwitcher = () => {
    setDatePickerVisible(!datePickerVisible);
  };

  const handleDatePickerClose = () => {
    setDatePickerVisible(false);
  };

  const handleDateChange = (date: moment.Moment | null) => {
    setSelectedDate(date);
    // setDatePickerVisible(false);
  };

  const handleTimeChange = (time: moment.Moment | null) => {
    setSelectedTime(time);
  };

  const handleDateTimeApply = () => {
    setDatePickerVisible(false);
    // handle apply logic here
  };

  return (
    <Modal
      title="Добавить контент"
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
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
            onClick={() => setIsModalOpen(false)}
            style={{
              borderRight: '1px solid #d9d9d9',
              borderRadius: '0',
              width: '33.33%',
            }}
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
        <Button icon={<PictureOutlined />} onClick={handleShowContentPlanPostsListModal}>Пост</Button>
        <Button icon={<VideoCameraOutlined />} disabled>Reels</Button>
        <Button icon={<PlayCircleOutlined />} disabled>Stories</Button>
      </div>
      <Divider />

      <div>{selectNewPost?.title}</div>

      <Button onClick={handleDatePickerSwitcher}>Выбрать дату и время</Button>

      <>
        <DatePicker
          open={datePickerVisible}
          onChange={handleDateChange}
          onOk={handleDatePickerClose}
          value={selectedDate}
          showTime={false}
          format="YYYY-MM-DD"
          onOpenChange={setDatePickerVisible}
        />
        <TimePicker
          // @ts-ignore
          value={selectedTime}
          // @ts-ignore
          onChange={handleTimeChange}
          format="HH:mm"
          style={{ marginTop: 20 }}
        />
      </>

      {/* {datePickerVisible && (
        <div style={{ marginTop: 20 }}>
          <Button type="primary" onClick={handleDateTimeApply}>
            Применить
          </Button>
          <Button onClick={handleDatePickerClose} style={{ marginLeft: 10 }}>
            Отмена
          </Button>
        </div>
      )} */}
    </Modal>
  );
};
