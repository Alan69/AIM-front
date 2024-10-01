import React from 'react'
import { List, Typography, Image } from 'antd';
import {
  CaretRightOutlined
} from '@ant-design/icons';
import cn from 'classnames';
import { SelectedPostPreview } from '../SelectedPostPreview/SelectedPostPreview';
import { TPostSerializer } from 'modules/content-plan/types';

import styles from './SelectedPreviewBlockModal.module.scss'

const { Title } = Typography;

type TProps = {
  selectedDatePreview: Date | null
  selectedPost: TPostSerializer | null | undefined
  formattedSelectedDate: string | null
  selectedEvents: any[] | null
  handleSelectEvent: (event: any) => void
  isOpen: boolean
  handleCloseModal: () => void
}

export const SelectedPreviewBlockModal = ({
  selectedDatePreview,
  selectedPost,
  formattedSelectedDate,
  selectedEvents,
  handleSelectEvent,
  isOpen,
  handleCloseModal
}: TProps) => {
  return (
    <div className={cn(styles.modalLayout, isOpen ? styles.modalLayout__isOpen : '')} onClick={handleCloseModal}>
      <div className={cn(styles.modalBody, isOpen ? styles.modalBody__isOpen : '')}>
        <div className={styles.closeButton} onClick={handleCloseModal}>{<CaretRightOutlined />}</div>
        <div className={styles.previewBlock} onClick={(e) => e.stopPropagation()}>
          {selectedDatePreview ? (
            <div className={styles.selectedEvents}>
              <Title level={5}>{formattedSelectedDate}</Title>
              {selectedEvents && selectedEvents.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedEvents}
                  renderItem={(item) => (
                    <List.Item
                      className={cn(styles.selectedPost, selectedPost?.id === item.id ? styles.selectedPost__isActive : '')}
                      onClick={() => handleSelectEvent(item)}
                    >
                      <List.Item.Meta
                        className={styles.selectedPost__content}
                        avatar={<Image width={32} height={32} src={item.picture} />}
                        title={
                          <div className={styles.selectedPost__text}>
                            <div className={styles.selectedPost__title}>{item.title}</div>
                            <div className={styles.selectedPost__time}>{item.time}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <p>Нет активный публикаций</p>
              )}
            </div>
          ) : ''}
          {selectedPost === null ? '' : <SelectedPostPreview selectedPost={selectedPost} />}
        </div>
      </div>
    </div>
  )
}
