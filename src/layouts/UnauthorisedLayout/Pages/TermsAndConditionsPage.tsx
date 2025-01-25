import React from "react";
import styles from "../UnauthorisedLayout.module.scss";

export const TermsAndConditionsPage = () => {
  return (
    <section className={styles.docsSection}>
      <h1 className={styles.docsSection__title}>Условия использования</h1>
      <div className={styles.docsSection__text}>
        Дата вступления в силу: 1 мая 2024 года
      </div>

      <div className={styles.docsSection__text}>
        Настоящие Условия использования (далее – "Условия") регулируют
        взаимодействие между вами и ТОО «A-Gene» (далее – "Компания") при
        использовании веб-сайта www.aimmagic.com (далее – "Веб-сайт"). Используя
        Веб-сайт, вы соглашаетесь соблюдать данные Условия.
      </div>

      <h3 className={styles.docsSection__subtitle}>1. Термины и определения</h3>
      <div className={styles.docsSection__text}>
        1.1 **Компания**: ТОО «A-Gene», владелец и администратор Веб-сайта.
      </div>
      <div className={styles.docsSection__text}>
        1.2 **Пользователь**: Лицо, использующее Веб-сайт для получения услуг или
        информации.
      </div>
      <div className={styles.docsSection__text}>
        1.3 **Услуга**: Действия или предложения, доступные на Веб-сайте.
      </div>
      <div className={styles.docsSection__text}>
        1.4 **Персональные данные**: Любая информация, которая может быть
        использована для идентификации Пользователя.
      </div>

      <h3 className={styles.docsSection__subtitle}>2. Использование Веб-сайта</h3>
      <div className={styles.docsSection__text}>
        2.1 Использование Веб-сайта возможно только в соответствии с настоящими
        Условиями и действующим законодательством Республики Казахстан.
      </div>
      <div className={styles.docsSection__text}>
        2.2 Компания оставляет за собой право изменять или дополнять данные
        Условия в одностороннем порядке. Актуальная версия всегда доступна на
        Веб-сайте.
      </div>
      <div className={styles.docsSection__text}>
        2.3 Пользователь обязуется предоставлять только достоверные данные при
        оформлении заказов и регистрации.
      </div>
      <div className={styles.docsSection__text}>
        2.4 Любое несанкционированное использование Веб-сайта запрещено.
      </div>

      <h3 className={styles.docsSection__subtitle}>3. Персональные данные</h3>
      <div className={styles.docsSection__text}>
        3.1 Компания обрабатывает персональные данные в соответствии с Законом
        Республики Казахстан "О персональных данных и их защите".
      </div>
      <div className={styles.docsSection__text}>
        3.2 Персональные данные используются исключительно для предоставления
        услуг, обработки заказов и улучшения работы Веб-сайта.
      </div>
      <div className={styles.docsSection__text}>
        3.3 Компания обязуется не передавать персональные данные третьим лицам,
        за исключением случаев, предусмотренных законодательством.
      </div>
      <div className={styles.docsSection__text}>
        3.4 Пользователь имеет право запросить удаление своих данных, связавшись
        с Компанией.
      </div>

      <h3 className={styles.docsSection__subtitle}>4. Права и обязанности сторон</h3>
      <div className={styles.docsSection__text}>
        4.1 Пользователь обязуется использовать Веб-сайт только в
        законных целях.
      </div>
      <div className={styles.docsSection__text}>
        4.2 Компания не несет ответственности за любые технические сбои или
        задержки в работе Веб-сайта.
      </div>
      <div className={styles.docsSection__text}>
        4.3 В случае нарушения Условий Пользователь может быть ограничен в
        доступе к Веб-сайту.
      </div>

      <h3 className={styles.docsSection__subtitle}>5. Оплата и возвраты</h3>
      <div className={styles.docsSection__text}>
        5.1 Все цены на Веб-сайте указаны в казахстанских тенге и могут быть
        изменены без предварительного уведомления.
      </div>
      <div className={styles.docsSection__text}>
        5.2 Оплата осуществляется через указанные на Веб-сайте методы.
      </div>
      <div className={styles.docsSection__text}>
        5.3 Возврат денежных средств возможен в соответствии с законодательством
        Республики Казахстан.
      </div>

      <h3 className={styles.docsSection__subtitle}>6. Изменения условий</h3>
      <div className={styles.docsSection__text}>
        6.1 Компания оставляет за собой право вносить изменения в данные Условия
        в любое время. Пользователь обязан самостоятельно проверять обновления.
      </div>

      <div className={styles.docsSection__text}>
        Для получения дополнительной информации или вопросов обращайтесь по
        адресу: support@aimmagic.com.
      </div>
    </section>
  );
};
