import React, { useState } from "react";
import { Button, Layout, message } from "antd";
import { useTypedSelector } from "hooks/useTypedSelector";
import {
  useCreateTargetAudienceMutation,
  useSaveTargetAudienceMutation,
} from "modules/target-audience/redux/api";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";
import { RedoOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

export const TargetAudiencePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_company } = useTypedSelector((state) => state.auth);

  const [createTargetAudience, { isLoading: isCreating }] =
    useCreateTargetAudienceMutation();
  const [saveTargetAudience, { isLoading: isSaving }] =
    useSaveTargetAudienceMutation();

  const [formattedResponse, setFormattedResponse] = useState("");

  const handleCreate = async () => {
    if (!current_company?.id) {
      return;
    }

    try {
      const result = await createTargetAudience({
        company: current_company.id,
      }).unwrap();
      const formattedText = formatResponse(result);
      setFormattedResponse(formattedText);
    } catch (error) {
      setFormattedResponse(t("target_audience.error_create"));
    }
  };

  const handleSave = async () => {
    try {
      await saveTargetAudience({ text: formattedResponse })
        .unwrap()
        .then(() => {
          navigate(`/company/${current_company?.id}`);
          message.success(t("target_audience.success_save"));
        });
    } catch (error) {
      message.error(t("target_audience.error_save"));
    }
  };

  const formatResponse = (data: any) => {
    if (!data?.result) return t("target_audience.no_data");

    return Object.entries(data.result)
      .map(([section, details]) => {
        // @ts-ignore
        const formattedDetails = Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        return `${section}:\n${formattedDetails}`;
      })
      .join("\n\n");
  };

  return (
    <Layout>
      <Content className="page-layout">
        <h1 className="main-title">{t("target_audience.title")}</h1>
        <Layout>
          <Content>
            <div style={{ position: "relative" }}>
              <TextArea
                rows={20}
                value={formattedResponse}
                onChange={(e) => setFormattedResponse(e.target.value)}
                disabled={isCreating || isSaving}
              />

              {!formattedResponse && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1,
                  }}
                >
                  <Button
                    type="primary"
                    onClick={handleCreate}
                    loading={isCreating || isSaving}
                  >
                    {t("target_audience.create")}
                  </Button>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <Button
                type="primary"
                onClick={handleSave}
                loading={isCreating || isSaving}
                disabled={!formattedResponse}
                style={{ marginRight: "10px" }}
              >
                {t("target_audience.save")}
              </Button>
              {formattedResponse && (
                <Button
                  type="default"
                  icon={<RedoOutlined />}
                  onClick={handleCreate}
                  loading={isCreating || isSaving}
                >
                  {t("target_audience.recreate")}
                </Button>
              )}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
