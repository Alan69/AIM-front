import React from "react";
import styles from "./VideoSection.module.scss";
// @ts-ignore
import videoSrc from "assets/video.mp4";

export const VideoSection = () => {
  return (
    <section className={styles.section}>
      <video
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        className={styles.video}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </section>
  );
};
