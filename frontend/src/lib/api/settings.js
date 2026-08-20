import { getApiUrl } from "../config/getApiUrl";

export const getTenantSettings = async (subdomain) => {
  const url = getApiUrl(subdomain);
  const response = await fetch(`${url}/tenant-settings/${subdomain}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

export const updateTenantSettings = async (subdomain, settings) => {
  const url = getApiUrl(subdomain);
  const response = await fetch(`${url}/tenant-settings/${subdomain}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  return response;
};
