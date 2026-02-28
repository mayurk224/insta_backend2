import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/posts",
  withCredentials: true,
});

export async function createPost(data) {
  try {
    const response = await api.post("/create-post", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function toggleLike(postId) {
  try {
    const response = await api.patch(`/${postId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function toggleSave(postId) {
  try {
    const response = await api.post(`/${postId}/save`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function addComment(postId, comment) {
  try {
    const response = await api.post(`/${postId}/comment`, { comment });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
