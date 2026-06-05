export type ApiUser = {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
};

export type MobileSession = {
  token: string;
  expiresAt: string;
};

export type ApiSuccess<T> = T & {
  ok: true;
};

export type ApiFailure = {
  ok: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
