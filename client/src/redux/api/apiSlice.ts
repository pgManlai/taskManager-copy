// slices/apiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URI = "http://localhost:8000/api";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URI,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
    }),
    getDashboard: builder.query<any, void>({
      query: () => ({
        url: "/task/dashboard",
        method: "GET",
      }),
    }),
    getTasks: builder.query<any[], void>({
      query: () => ({
        url: "/task",
        method: "GET",
      }),
    }),
    createTasks: builder.mutation<any, any>({
      query: (newTask) => ({
        url: "/task/create",
        method: "POST",
        body: newTask,
      }),
    }),
    getTaskById: builder.query<any, number>({
      query: (id) => ({
        url: `/task/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetDashboardQuery,
  useGetTasksQuery,
  useCreateTasksMutation,
  useGetTaskByIdQuery,
} = apiSlice;
