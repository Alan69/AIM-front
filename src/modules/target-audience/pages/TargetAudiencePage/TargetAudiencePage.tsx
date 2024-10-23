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

const { Content } = Layout;

export const TargetAudiencePage = () => {
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
      setFormattedResponse("Error creating target audience");
    }
  };

  const handleSave = async () => {
    try {
      await saveTargetAudience({ text: formattedResponse })
        .unwrap()
        .then(() => {
          navigate(`/company/${current_company?.id}`);
          message.success("Целевая аудитория успешно сохранена");
        });
    } catch (error) {}
  };

  const formatResponse = (data: any) => {
    if (!data?.result) return "";

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
        <h1 className="main-title">Целевая аудитория</h1>
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
                    Создать
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
                Сохранить
              </Button>
              {formattedResponse && (
                <Button
                  type="default"
                  icon={<RedoOutlined />}
                  onClick={handleCreate}
                  loading={isCreating || isSaving}
                >
                  Пересоздать
                </Button>
              )}
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
