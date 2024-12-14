import { useNavigate } from "@remix-run/react";
import * as auth from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

class FetchError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "FetchError";
  }
}

interface RefreshTokenResponse {
  token: string;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await window.fetch("/auth/refresh-token", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new UnauthorizedError();
  }

  const { token }: RefreshTokenResponse = await response.json();
  return token;
}

export default function useFetch() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, refreshToken } = useAppSelector((state) => state.auth);

  const updateHeaders = (headers: Record<string, string>) => {
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const tryRefreshToken = async (): Promise<string | null> => {
    if (!refreshToken) {
      return null;
    }
    try {
      const newToken = await refreshAccessToken(refreshToken);
      dispatch(auth.refreshToken(newToken));
      return newToken;
    } catch (error) {
      dispatch(auth.logout());
      navigate("/");
      throw new UnauthorizedError();
    }
  };

  return async function fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = updateHeaders((options.headers || {}) as Record<string, string>);
    options.headers = headers;

    try {
      const response = await window.fetch(url, options);

      if (response.status === 401) {
        const newToken = await tryRefreshToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          return await window.fetch(url, { ...options, headers });
        }
      }

      if (!response.ok) {
        throw new FetchError("Failed to fetch data", response.status);
      }

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        requestAnimationFrame(() => dispatch(auth.logout()));
        navigate("/");
      }
      throw error;
    }
  };
}
