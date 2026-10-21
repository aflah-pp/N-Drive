import api from '../api';

export const getTransactions = async () => {
  const { data } = await api.get('/transactions/');
  return data;
};

export const getReceipt = async (trxId) => {
  const response = await api.get(`/invoice/${trxId}/`, {
    responseType: 'blob',
  });
  return response;
};

export const initiatePayment = async ({ packageId }) => {
  const { data } = await api.post('/payment/initiate/', { package_id: packageId });
  return data;
};

export const updatePaymentStatus = async ({ orderId, status }) => {
  const { data } = await api.post('/payment/status/', {
    order_id: orderId,
    status,
  });
  return data;
};
