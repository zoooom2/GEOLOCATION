export const getUniqueValues = (
  data: Record<string, any>[] = [],
  type: string
) => {
  let unique = data.map((item) => item[type]);
  unique = unique.flat();
  const uniqueSet = new Set(unique);

  return [...uniqueSet];
};

// export const axiosInstance = axios.create({ withCredentials: true });

// axiosInstance.interceptors.request.use(
//   async (req) => {
//     if (!req.cookies) {
//       const res = await axios.post(`/api/v1/users/refreshToken`, {});
//       console.log(res);
//     }

//     return req;
//   },
//   (error) => Promise.reject(error)
// );
