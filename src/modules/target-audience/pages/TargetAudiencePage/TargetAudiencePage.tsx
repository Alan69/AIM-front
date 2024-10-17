import React, { useState } from 'react'
import { Button, Layout } from 'antd';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { useCreateTargetAudienceMutation, useSaveTargetAudienceMutation } from 'modules/target-audience/redux/api';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

export const TargetAudiencePage = () => {
  const navigate = useNavigate();

  const { current_company } = useTypedSelector((state) => state.auth);
  const [createTargetAudience, { isLoading: isCreating }] = useCreateTargetAudienceMutation();
  const [saveTargetAudience, { isLoading: isSaving }] = useSaveTargetAudienceMutation();

  const [formattedResponse, setFormattedResponse] = useState('');

  const handleCreate = async () => {
    if (!current_company?.id) {
      return;
    }

    try {
      const result = await createTargetAudience({ company: current_company.id }).unwrap();
      const formattedText = formatResponse(result);
      setFormattedResponse(formattedText);
    } catch (error) {
      setFormattedResponse('Error creating target audience');
    }
  };

  const handleSave = async () => {
    try {
      await saveTargetAudience({ text: formattedResponse }).unwrap().then(() => navigate(`company/${current_company?.id}`));
    } catch (error) {
    }
  };

  const formatResponse = (data: any) => {
    if (!data?.result) return '';

    return Object.entries(data.result)
      .map(([section, details]) => {
        // @ts-ignore
        const formattedDetails = Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        return `${section}:\n${formattedDetails}`;
      })
      .join('\n\n');
  };

  return (
    <Layout>
      <Content className='page-layout'>
        <h1 className='main-title'>Целевая аудитория</h1>
        <Layout>
          <Content>
            <TextArea
              rows={20}
              value={formattedResponse}
              readOnly
              placeholder="Здесь будет отображаться отформатированный ответ"
              style={{ marginTop: '20px' }}
              disabled={isCreating || isSaving}
            />
            <Button type="primary" onClick={handleCreate} loading={isCreating || isSaving}>
              Создать
            </Button>
            <Button type="primary" onClick={handleSave} loading={isCreating || isSaving}>
              Сохранить
            </Button>
          </Content>
        </Layout>
      </Content>
    </Layout>
  )
}
