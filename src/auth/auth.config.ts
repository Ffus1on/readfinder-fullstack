export const AUTH_MODULE_OPTIONS = 'AUTH_MODULE_OPTIONS';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export interface AuthModuleOptions {
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath: string;
  websiteBasePath: string;
  connectionURI: string;
  apiKey?: string;
}
