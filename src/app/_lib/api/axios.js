import axios from 'axios';

const BASE_URL = process.env.DOMAIN;
// const BASE_URL = 'http://192.168.3.183:3000'; // LOCAL server
//const BASE_URL = 'https://expense-tracker-marjan.netlify.app'; // LIVE server

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['Cross-Origin-Resource-Policy'] = 'cross-origin';

export default axios.create();

// export const axiosPrivate = axios.create({
//   withCredentials: true,
// });
