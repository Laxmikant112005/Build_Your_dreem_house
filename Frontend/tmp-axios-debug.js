import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });
console.log(api.getUri({ url: '/auth/me' }));
console.log(api.getUri({ url: 'auth/me' }));
console.log(api.getUri({ url: '/engineers/me/dashboard' }));
console.log(api.getUri({ url: 'engineers/me/dashboard' }));
