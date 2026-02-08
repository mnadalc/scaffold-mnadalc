export type Language = 'ts' | 'js';
export type ReactVersion = 'latest' | '18';
export type Database = 'none' | 'mysql' | 'postgres' | 'mongodb';
export type StarterApiMode = 'none' | 'query' | 'mutation' | 'both';
export type FrontendGroup = 'reactQuery' | 'tailwind' | 'zod' | 'msw' | 'lintTools';
export type BaseFolder = 'api' | 'components' | 'contexts' | 'types' | 'tests';

export type Answers = {
  projectName: string;
  withBackend: boolean;
  frontendLanguage: Language;
  reactVersion: ReactVersion;
  includeVitest: boolean;
  includePlaywright: boolean;
  useFrontendPreset: boolean;
  frontendGroups: FrontendGroup[];
  baseFolders: BaseFolder[];
  starterApiMode: StarterApiMode;
  domainName: string;
  queryName: string;
  mutationName: string;
  backendLanguage: Language;
  database: Database;
  includeBackendZod: boolean;
  installNow: boolean;
};
