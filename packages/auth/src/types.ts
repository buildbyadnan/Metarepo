export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}
