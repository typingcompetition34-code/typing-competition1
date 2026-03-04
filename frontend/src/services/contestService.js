import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token } : {};
};

export const createContest = async (data) => {
    const response = await axios.post(`${API_URL}/contests`, data, { headers: getAuthHeader() });
    return response.data;
};

export const acceptContest = async (contestId) => {
    const response = await axios.post(`${API_URL}/contests/${contestId}/accept`, {}, { headers: getAuthHeader() });
    return response.data;
};

export const getContest = async (contestId) => {
    const response = await axios.get(`${API_URL}/contests/${contestId}`, { headers: getAuthHeader() });
    return response.data;
};

export const getUserContests = async () => {
    const response = await axios.get(`${API_URL}/contests`, { headers: getAuthHeader() });
    return response.data;
};

export const getOpenContests = async () => {
    const response = await axios.get(`${API_URL}/contests/open/all`, { headers: getAuthHeader() });
    return response.data;
};
