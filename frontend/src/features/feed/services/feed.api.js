import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/feed",
  withCredentials: true,
});

export async function fetchFeed({ page = 1, limit = 10 } = {}) {
  try {
    const response = await api.get("/", { params: { page, limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

