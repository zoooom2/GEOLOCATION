export const getUniqueValues = (
  data: Record<string, any>[] = [],
  type: string
) => {
  let unique = data.map((item) => item[type]);
  unique = unique.flat();
  const uniqueSet = new Set(unique);

  return [...uniqueSet];
};

export const getPolygonCenter = (arr: { lat: number; lng: number }[]) => {
  const center = arr.reduce(
    (acc, val) => [acc[0] + val.lat, acc[1] + val.lng],
    [0, 0]
  );
  center[0] /= arr.length;
  center[1] /= arr.length;
  return center as [number, number];
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
