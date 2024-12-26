import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Layout, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  useGetCurrentTargetAudienceQuery,
  useUpdateTargetAudienceMutation,
} from "modules/target-audience/redux/api";
import { useTypedSelector } from "hooks/useTypedSelector";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

export const TargetAudienceUpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { current_company } = useTypedSelector((state) => state.auth);
  const { t } = useTranslation();

  const [updateTargetAudience, { isLoading: isUpdating }] =
    useUpdateTargetAudienceMutation();

  const {
    data: targetAudience,
    refetch: refetchTargetAudience,
    isLoading,
  } = useGetCurrentTargetAudienceQuery();

  const [formattedResponse, setFormattedResponse] = useState("");

  useEffect(() => {
    if (targetAudience?.text) {
      setFormattedResponse(targetAudience.text);
    }
  }, [targetAudience]);

  const handleSave = async () => {
    try {
      await updateTargetAudience({ text: formattedResponse, id: id })
        .unwrap()
        .then(() => {
          navigate(`/company/${current_company?.id}`);
          message.success(t("targetAudienceUpdatePage.save_success"));
        });
      refetchTargetAudience();
    } catch (error) {
      message.error(t("targetAudienceUpdatePage.save_error"));
    }
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("targetAudienceUpdatePage.title")}</h1>
        <Layout>
          <Content>
            <TextArea
              rows={20}
              value={formattedResponse}
              onChange={(e) => setFormattedResponse(e.target.value)}
              disabled={isUpdating || isLoading}
            />

            <div style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                onClick={handleSave}
                loading={isUpdating}
                disabled={!formattedResponse || isLoading}
                style={{ marginRight: "10px" }}
              >
                {t("targetAudienceUpdatePage.save_button")}
              </Button>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
