import React, { useState } from 'react';
import cn from 'classnames';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import { contentPlanActions } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { SelectedPostPreview } from '../SelectedPostPreview/SelectedPostPreview';
import styles from './ContentPlanCalendar.module.scss';
import { TPostSerializer } from 'modules/content-plan/types';
import { TSchedulesrData } from 'modules/content-plan/redux/api';

moment.locale('ru');

type TProps = {
  showModal: () => void
  selectedPost: TPostSerializer | null | undefined
  postList: TSchedulesrData[] | undefined
}

export const ContentPlanCalendar = ({ showModal, selectedPost, postList }: TProps) => {
  const dispatch = useDispatch();
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop(Calendar);

  const events = postList?.map((postItem) => ({
    id: postItem.id,
    title: postItem.post.title,
    start: new Date(postItem.scheduled_time),
    end: new Date(new Date(postItem.scheduled_time).getTime() + 2 * 60 * 60 * 1000), // Допустим, событие длится 2 часа
    resourceId: postItem.post.id,
    main_text: postItem.post.main_text,
    hashtags: postItem.post.hashtags,
    time: moment(postItem.scheduled_time).format('HH:mm'),
    picture: postItem.post.picture,
  })) || [];

  console.log('events', events);

  const messages = {
    allDay: 'Весь день',
    previous: 'Предыдущий',
    next: 'Следующий',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    agenda: 'Повестка дня',
    date: 'Дата',
    time: 'Время',
    event: 'Событие',
    noEventsInRange: 'Событий нет',
    showMore: (total: any) => `+ Показать больше (${total})`,
  };

  const handleSelectEvent = (event: any) => {
    // if (selectedPost === null || selectedPost === undefined) {
    //   dispatch(contentPlanActions.setSelectedPost(event));
    // } else {
    //   dispatch(contentPlanActions.setSelectedPost(null));
    // }
    dispatch(contentPlanActions.setSelectedPost(event));
  };

  const EventComponent = ({ event }: { event: any }) => {
    return (
      <div
        className={styles.eventContainer}
        style={{
          backgroundImage: `url(${event.picture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div className={styles.eventTitle}>{event.title}</div>
        <div className={styles.eventTime}>{event.time}</div>
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const label = () => {
      const date = new Date(toolbar.date);
      const month = date.toLocaleString('ru-RU', { month: 'long' });
      const year = date.getFullYear();

      return (
        <span>
          <b>{month.charAt(0).toUpperCase() + month.slice(1)}</b> {year}
        </span>
      );
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToBack}>
            &larr;
          </button>
          <span className="rbc-toolbar-label">{label()}</span>
          <button type="button" onClick={goToNext}>
            &rarr;
          </button>
        </span>
      </div>
    );
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Добавить контент
      </Button>
      <div className={styles.container}>
        <DnDCalendar
          className={cn(styles.calendar, selectedPost === null ? styles.calendarIsFull : '')}
          localizer={localizer}
          events={events}
          draggableAccessor={(event) => true}
          style={{ height: 1000 }}
          popup
          views={['month']}
          defaultView="month"
          toolbar
          components={{
            toolbar: CustomToolbar,
            event: EventComponent,
          }}
          messages={messages}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={() => ({
            style: {
              border: 'none',
              padding: 0,
            },
          })}
          slotPropGetter={() => ({
            style: {
              height: 'auto',
            },
          })}
        />
        {selectedPost === null ? '' : <SelectedPostPreview selectedPost={selectedPost} />}
      </div>
    </div>
  );
};
