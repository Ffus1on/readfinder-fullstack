export const AUTH_MODULE_OPTIONS = 'AUTH_MODULE_OPTIONS';

export interface AuthModuleOptions {
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath: string;
  websiteBasePath: string;
  connectionURI: string;
  apiKey?: string;
}
