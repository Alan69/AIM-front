import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import styles from "./ContentPlanCalendar.module.scss";
import { TSchedulesData } from "modules/content-plan/redux/api";
import { contentPlanActions } from "modules/content-plan/redux/slices/contentPlan.slice";
import {
  useIsLargeLaptop,
  useIsSmallLaptop,
  useIsTablet,
  useIsXlTablet,
} from "hooks/media";
import { useTranslation } from "react-i18next";
import "moment/locale/ru";
import "moment/locale/en-gb";

moment.locale("ru");

type TProps = {
  contentPlanList: TSchedulesData[] | undefined;
  handleSelectEvent: (event: any) => void;
  selectedDatePreview: Date | null;
  setSelectedDatePreview: React.Dispatch<React.SetStateAction<Date | null>>;
  setSelectedEvents: React.Dispatch<React.SetStateAction<any[] | null>>;
  setFormattedSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ContentPlanCalendar = ({
  contentPlanList,
  handleSelectEvent,
  selectedDatePreview,
  setSelectedDatePreview,
  setSelectedEvents,
  setFormattedSelectedDate,
}: TProps) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const localizer = momentLocalizer(moment);
  const DnDCalendar = withDragAndDrop(Calendar);
  const isLargeLaptop = useIsLargeLaptop();
  const isSmallLaptop = useIsSmallLaptop();
  const isXlTablet = useIsXlTablet();
  const isTablet = useIsTablet();

  const calendarHeight = isTablet
    ? 400
    : isXlTablet
      ? 500
      : isSmallLaptop
        ? 600
        : isLargeLaptop
          ? 700
          : 800;

  const [currentDate, setCurrentDate] = useState(new Date());

  const events =
    contentPlanList?.map((item) => {
      const startDateTime = moment(
        `${item.scheduled_date}T${item.scheduled_time}`
      ).toDate();
      const endDateTime = moment(startDateTime).add(2, "hours").toDate();

      const updatedMedia = () => {
        if (item.post.id) {
          if (item.post.picture?.includes("no_img")) {
            return item.post.previouspostimage;
          } else {
            return [{ media: item.post.picture }];
          }
        }
        if (item.reel.id) {
          return item.reel.previous_media;
        }
        if (item.storie.id) {
          return [{ media: item.storie.media }];
        }
      };

      return {
        id: item.id,
        title: item.post.title
          ? `Post: ${item.post.title}`
          : "" || item.reel.title
            ? `Reels: ${item.reel.title}`
            : "" || item.storie.id
              ? "Stories"
              : "",
        start: startDateTime,
        end: endDateTime,
        resourceId: item.post.id || item.reel.id || item.storie.id,
        main_text:
          item.post.main_text || item.reel.main_text || item.storie.id
            ? ""
            : "",
        hashtags: item.post.hashtags || item.reel.hashtags,
        time: moment(startDateTime).format("HH:mm"),
        scheduled_date: item.scheduled_date,
        scheduled_time: item.scheduled_time,
        media: updatedMedia(),
      };
    }) || [];

  const messages = {
    allDay: t("content_plan.content_plan_calendar.all_day"),
    previous: t("content_plan.content_plan_calendar.previous"),
    next: t("content_plan.content_plan_calendar.next"),
    today: t("content_plan.content_plan_calendar.today"),
    month: t("content_plan.content_plan_calendar.month"),
    week: t("content_plan.content_plan_calendar.week"),
    day: t("content_plan.content_plan_calendar.day"),
    agenda: t("content_plan.content_plan_calendar.agenda"),
    date: t("content_plan.content_plan_calendar.date"),
    time: t("content_plan.content_plan_calendar.time"),
    event: t("content_plan.content_plan_calendar.event"),
    noEventsInRange: t("content_plan.content_plan_calendar.no_events_in_range"),
    showMore: (total: any) =>
      t("content_plan.content_plan_calendar.show_more", { total }),
  };

  const handleSelectSlot = (slotInfo: any) => {
    dispatch(contentPlanActions.setSelectedPost(null));

    if (
      selectedDatePreview &&
      moment(slotInfo.start).isSame(selectedDatePreview, "day")
    ) {
      setSelectedDatePreview(null);
      setSelectedEvents(null);
      setFormattedSelectedDate(null);
    } else {
      const selectedDateEvents = events.filter((event) =>
        moment(event.start).isSame(slotInfo.start, "day")
      );
      setSelectedEvents(selectedDateEvents);
      setSelectedDatePreview(slotInfo.start);
      setFormattedSelectedDate(moment(slotInfo.start).format("D MMMM, YYYY"));
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
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      setCurrentDate(nextDate);
      toolbar.onNavigate("NEXT");
    };

    const label = () => {
      const date = new Date(toolbar.date);
      const month = date.toLocaleString(i18n.language, { month: "long" });
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
    if (
      selectedDatePreview &&
      moment(date).isSame(selectedDatePreview, "day")
    ) {
      style = {
        backgroundColor: "#d4f0ff",
        border: "1px solid #1890ff",
      };
    }
    return {
      style: {
        ...style,
        cursor: "pointer",
      },
    };
  };

  useEffect(() => {
    const currentLang = i18n.language;
    moment.locale(currentLang);
  }, [i18n.language]);

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
          style={{ height: calendarHeight }}
          popup
          views={["month"]}
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
              border: "none",
              padding: 0,
              backgroundColor: "transparent",
              color: "rgba(255, 119, 0, 1)",
            },
          })}
          slotPropGetter={() => ({
            style: {
              height: "auto",
            },
          })}
        />
      </div>
    </div>
  );
};

export default ContentPlanCalendar;
