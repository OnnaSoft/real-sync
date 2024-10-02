import { useNavigate } from "@remix-run/react";
import { logout } from "../store/slices/authSlice";
import { useAppDispatch } from "../store/hooks";

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export default function useFetch() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return function fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return window
      .fetch(url, options)
      .then(async (response) => {
        if (response.status === 401) {
          throw new UnauthorizedError();
        }
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response;
      })
      .catch((error) => {
        if (error instanceof UnauthorizedError) {
          requestAnimationFrame(() => dispatch(logout()));
          navigate("/");
        }
        throw error;
      });
  };
}
