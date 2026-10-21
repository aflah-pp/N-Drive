import api from '../api';

export const getBinStorage = async () => {
  const { data } = await api.get('/storage/bin/');
  return data;
};

export const restoreBinItem = async ({ itemType, id }) => {
  const { data } = await api.post(`/bin/restore/${itemType}/${id}/`);
  return data;
};

export const restoreBin = async () => {
  const { data } = await api.post('/bin/restore/');
  return data;
};

export const clearBin = async () => {
  const { data } = await api.delete('/bin/clear/');
  return data;
};
