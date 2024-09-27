import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import styles from './ContentPlanCalendar.module.scss';
import { TSchedulesrData } from 'modules/content-plan/redux/api';
import { contentPlanActions } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { useDispatch } from 'react-redux';

moment.locale('ru');

type TProps = {
  postList: TSchedulesrData[] | undefined
  handleSelectEvent: (event: any) => void
  selectedDatePreview: Date | null
  setSelectedDatePreview: React.Dispatch<React.SetStateAction<Date | null>>
  setSelectedEvents: React.Dispatch<React.SetStateAction<any[] | null>>
  setFormattedSelectedDate: React.Dispatch<React.SetStateAction<string | null>>
}

export const ContentPlanCalendar = ({
  postList,
  handleSelectEvent,
  selectedDatePreview,
  setSelectedDatePreview,
  setSelectedEvents,
  setFormattedSelectedDate,
}: TProps) => {
  const dispatch = useDispatch();
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop(Calendar);

  const [currentDate, setCurrentDate] = useState(new Date());

  const events = postList?.map((postItem) => {
    const startDateTime = moment(`${postItem.scheduled_date}T${postItem.scheduled_time}`).toDate();
    const endDateTime = moment(startDateTime).add(2, 'hours').toDate();

    return {
      id: postItem.id,
      title: postItem.post.title,
      start: startDateTime,
      end: endDateTime,
      resourceId: postItem.post.id,
      main_text: postItem.post.main_text,
      hashtags: postItem.post.hashtags,
      time: moment(startDateTime).format('HH:mm'),
      picture: postItem.post.picture,
    };
  }) || [];

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
    showMore: (total: any) => `Еще (${total})`
  };

  const handleSelectSlot = (slotInfo: any) => {
    dispatch(contentPlanActions.setSelectedPost(null));

    if (selectedDatePreview && moment(slotInfo.start).isSame(selectedDatePreview, 'day')) {
      setSelectedDatePreview(null);
      setSelectedEvents(null);
      setFormattedSelectedDate(null);
    } else {
      const selectedDateEvents = events.filter(
        (event) => moment(event.start).isSame(slotInfo.start, 'day')
      );
      setSelectedEvents(selectedDateEvents);
      setSelectedDatePreview(slotInfo.start);
      setFormattedSelectedDate(moment(slotInfo.start).format('D MMMM, YYYY'));
    }
  };

  const EventComponent = ({ event }: { event: any }) => {
    return (
      <div className={styles.eventContainer}>
        <div className={styles.eventTitle}>{event.title}</div>
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      const prevDate = new Date(currentDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      setCurrentDate(prevDate);
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      setCurrentDate(nextDate);
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

  const handleShowMore = (events: any[], date: Date) => {
    return;
  };

  const dayPropGetter = (date: Date) => {
    let style = {};
    if (selectedDatePreview && moment(date).isSame(selectedDatePreview, 'day')) {
      style = {
        backgroundColor: '#d4f0ff',
        border: '1px solid #1890ff',
      };
    }
    return {
      style: {
        ...style,
        cursor: 'pointer',
      },
    };
  };

  return (
    <div>
      <div className={styles.container}>
        <DnDCalendar
          className={styles.calendar}
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={setCurrentDate}
          draggableAccessor={(event) => false}
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
          onSelectSlot={handleSelectSlot}
          selectable
          dayPropGetter={dayPropGetter}
          onShowMore={handleShowMore}
          eventPropGetter={() => ({
            style: {
              border: 'none',
              padding: 0,
              backgroundColor: 'transparent',
              color: 'rgba(255, 119, 0, 1)',
            },
          })}
          slotPropGetter={() => ({
            style: {
              height: 'auto',
            },
          })}
        />
      </div>
    </div>
  );
};
