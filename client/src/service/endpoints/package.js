import api from '../api';

export const getAllPackage = async () => {
  const { data } = await api.get('/packages/');

  return data;
};

export const getAvailableStorage = async () => {
  const { data } = await api.get('/storage/');

  return data;
};

export const getStorageUsage = async () => {
  const { data } = await api.get('/storage/usage/');

  return data;
};
