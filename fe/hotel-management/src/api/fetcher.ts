import axiosInstance from './axios';

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

export default fetcher;