import api from '../api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/register/', payload);

  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/login/', payload);

  return data;
};

export const refreshUserToken = async () => {
  const { data } = await api.post('/refresh/');

  return data;
};
export const logoutUser = async () => {
  const { data } = await api.post('/logout/');

  return data;
};
