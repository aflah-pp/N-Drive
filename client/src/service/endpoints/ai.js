import api from '../api';

export const getChatHistory = async () => {
  const { data } = await api.get('/chat/history/');
  return data;
};

export const sendChatMessage = async (message) => {
  const { data } = await api.post('/chat/', { message });
  return data;
};

export const saveChatSession = async (conversation) => {
  const { data } = await api.post('/chat/save/', { conversation });
  return data;
};

export const resetChatSession = async () => {
  const { data } = await api.delete('/chat/reset/');
  return data;
};

export const generateImage = async ({ prompt }) => {
  const { data } = await api.post('/img/gen/', { prompt }, { timeout: 180_000 });
  return data;
};

export const getUserImages = async () => {
  const { data } = await api.get('/img/all/');
  return data;
};

export const deleteGeneratedImage = async (imgId) => {
  const { data } = await api.delete(`/img/${imgId}/`);
  return data;
};
