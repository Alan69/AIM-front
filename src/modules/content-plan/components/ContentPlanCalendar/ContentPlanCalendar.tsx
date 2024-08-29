import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Button } from 'antd';

moment.locale('ru');

type TProps = {
  showModal: () => void
}

export const ContentPlanCalendar = ({ showModal }: TProps) => {
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop(Calendar);

  const events = [
    {
      id: 0,
      title: 'Board meeting',
      start: new Date(2024, 7, 22, 9, 0, 0),
      end: new Date(2024, 7, 22, 13, 0, 0),
      resourceId: 1,
    },
    {
      id: 1,
      title: 'Team lunch',
      start: new Date(2024, 7, 23, 12, 0, 0),
      end: new Date(2024, 7, 23, 13, 0, 0),
      resourceId: 2,
    },
    {
      id: 2,
      title: 'Conference',
      start: new Date(2024, 7, 24, 10, 0, 0),
      end: new Date(2024, 7, 24, 15, 0, 0),
      resourceId: 3,
    },
    {
      id: 3,
      title: 'Meeting with client',
      start: new Date(2024, 7, 25, 14, 0, 0),
      end: new Date(2024, 7, 25, 16, 0, 0),
      resourceId: 4,
    },
    {
      id: 4,
      title: 'Board meeting',
      start: new Date(2024, 7, 22, 9, 0, 0),
      end: new Date(2024, 7, 22, 13, 0, 0),
      resourceId: 1,
    },
    {
      id: 5,
      title: 'Board meeting',
      start: new Date(2024, 7, 22, 9, 0, 0),
      end: new Date(2024, 7, 22, 13, 0, 0),
      resourceId: 1,
    },
  ];

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
    // @ts-ignore
    showMore: (total) => `+ Показать больше (${total})`,
  };


  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
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
        Добавить пост
      </Button>
      <DnDCalendar
        localizer={localizer}
        events={events}
        draggableAccessor={(event) => true}
        style={{ height: 500 }}
        popup
        views={['month']}
        defaultView="month"
        toolbar
        components={{
          toolbar: CustomToolbar,
        }}
        messages={messages}
      />
    </div>
  );
};
