import React from 'react'
import { Modal, Button, Divider, List, Image, Typography, Tabs, TabsProps } from 'antd';
import cn from 'classnames'

import styles from './ContentPlanPostList.module.scss'
import { TPostData } from 'modules/post/redux/api';

const { Title, Paragraph } = Typography;

type TProps = {
  postListByCompanyId: TPostData[] | undefined
  selectCurrentPost: TPostData | null
  setSelectCurrentPost: React.Dispatch<React.SetStateAction<TPostData | null>>
  expandedKeys: Record<number, boolean>
  toggleExpand: (index: number) => void
}

export const ContentPlanPostList = ({ postListByCompanyId, selectCurrentPost, setSelectCurrentPost, expandedKeys, toggleExpand }: TProps) => {
  return (
    <div className={styles.modalWithScroll}>
      <List
        itemLayout="horizontal"
        dataSource={postListByCompanyId?.filter((el) => el.like)}
        renderItem={(item, index) => (
          <List.Item
            onClick={() => setSelectCurrentPost(item)}
            className={cn(styles.item, selectCurrentPost?.id === item.id ? styles.item__isActive : '')}
          >
            <List.Item.Meta
              avatar={<Image width={160} height={160} src={item.picture} />}
              title={<Title level={5}>{item.title}</Title>}
              description={
                <>
                  <Paragraph
                    className={styles.text}
                    ellipsis={!expandedKeys[index] ? { rows: 4, expandable: false } : false}
                  >
                    {item.main_text}
                  </Paragraph>
                  <div className={styles.expandBtn}>
                    <Button type="link" onClick={() => toggleExpand(index)}>
                      {expandedKeys[index] ? 'Скрыть' : 'Развернуть'}
                    </Button>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}
