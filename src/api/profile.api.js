import api from "../utility/axios";

const BASE = "/companies";

export const profileApi = {
  getProfile() {
    return api.get(`${BASE}/profile/`);
  },
  updateProfile(data) {
    return api.patch(`${BASE}/profile/`, data);
  },
  changePassword(oldPassword, newPassword) {
    return api.post(`${BASE}/profile/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
  getCurrentCompany() {
    return api.get(`${BASE}/company/current/`);
  },
  updateCurrentCompany(data) {
    return api.patch(`${BASE}/company/current/`, data);
  },
  getCompanyUsers() {
    return api.get(`${BASE}/users/`);
  },
  updateCompanyUser(userId, data) {
    return api.patch(`${BASE}/users/${userId}/`, data);
  },
  removeCompanyUser(userId) {
    return api.delete(`${BASE}/users/${userId}/`);
  },
  updateCompanyUserProfile(userId, data) {
    return api.patch(`${BASE}/users/${userId}/profile/`, data);
  },
  createUser(data) {
    return api.post(`${BASE}/users/create/`, data);
  },
};
