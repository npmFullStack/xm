import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api/auth";

export function useAuth() {
  const login = async (data) => {
    const res = await axios.post(`${API_URL}/login`, data);
    await AsyncStorage.setItem("authToken", res.data.token);
    await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
    return res.data.user;
  };

  const register = async (data) => {
    const res = await axios.post(`${API_URL}/register`, data);
    await AsyncStorage.setItem("authToken", res.data.token);
    await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
    return res.data.user;
  };

  const logout = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      await axios.post(
        `${API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    await AsyncStorage.clear();
  };

  const getUser = async () => {
    const data = await AsyncStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  };

  return { login, register, logout, getUser };
}
