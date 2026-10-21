import api from '../api';

export const getCurrentUser = async () => {
  const { data } = await api.get('/me/');

  return data.user;
};

export const updateCurrentUser = async (payload) => {
  const { data } = await api.put('/me/update/', payload);

  return data;
};
