import { GeneralSettings } from "../types";

export const createApiClient = (settings: GeneralSettings) => {
  const baseUrl = settings.backendBaseUrl || "http://localhost:8000";
  const token = settings.backendApiToken || "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return {
    get: async (endpoint: string) => {
      try {
        const url = new URL(`${baseUrl}${endpoint}`);
        url.searchParams.append("_t", new Date().getTime().toString());
        
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("API GET Error:", error);
        throw error;
      }
    },

    post: async (endpoint: string, data: any) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("API POST Error:", error);
        throw error;
      }
    },

    put: async (endpoint: string, data: any) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("API PUT Error:", error);
        throw error;
      }
    },

    delete: async (endpoint: string) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "DELETE",
          headers,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("API DELETE Error:", error);
        throw error;
      }
    },
  };
};
