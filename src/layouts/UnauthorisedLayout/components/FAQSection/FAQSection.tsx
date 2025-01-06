import React, { useState } from "react";
import cn from "classnames";
import { Collapse } from "antd";
import styles from "./FAQSection.module.scss";
import { ReactComponent as IconArrow } from "assets/arrow-grey.svg";
import { useTranslation } from "react-i18next";

const { Panel } = Collapse;

export const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  const handlePanelChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const faqData = t("faqSection.items", { returnObjects: true }) as {
    question: string;
    answer: string;
  }[];

  return (
    <section className={styles.section} id="FAQSection">
      <h2 className={styles.title}>{t("faqSection.title")}</h2>
      <Collapse
        accordion
        className={styles.accordion}
        expandIcon={() => null}
        activeKey={activeKey}
        onChange={handlePanelChange}
      >
        {faqData.map((item, index) => (
          <Panel
            key={index}
            className={styles.item}
            header={
              <h4
                className={cn(
                  styles.item__title,
                  activeKey[0] === index.toString()
                    ? styles.item__title__isActive
                    : ""
                )}
              >
                {item.question}
                <IconArrow
                  className={cn(
                    styles.arrowIcon,
                    activeKey[0] === index.toString()
                      ? styles.arrowIcon__isActive
                      : ""
                  )}
                />
              </h4>
            }
          >
            <p className={styles.item__text}>{item.answer}</p>
          </Panel>
        ))}
      </Collapse>
    </section>
  );
};
