import axios, { AxiosInstance } from 'axios';

export type Http = AxiosInstance;
export function createHttp() {
  return axios.create({
    baseURL: process.env.REACT_APP_API_URL
  });
}
