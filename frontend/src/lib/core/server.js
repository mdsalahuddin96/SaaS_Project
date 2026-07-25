export const serverFetch = async (subdomain, path) => {
  const res = await fetch(`http://${subdomain}.localhost:5000/${path}`);
  const data = await res.json();
  return data;
};

