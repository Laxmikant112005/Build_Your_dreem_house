// Order API service
import api from './api';

const orderService = {
  checkout: (deliveryData, paymentData) => api.post('/orders/checkout', { delivery: deliveryData, payment: paymentData }),
  confirmPayment: ({ orderId, paymentIntentId, gateway }) => api.post('/orders/confirm-payment', { orderId, paymentIntentId, gateway }),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
};

export default orderService;

