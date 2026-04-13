export type Application = {
  id: string;
  iframeBaseUrl: string;
};

export type Feature = {
  id: string;
  label: string;
  markdown: string;
  applicationId: string;
};

export type Changeset = {
  elementId: string;
  original: string;
  edited: string;
};

export type InspoAttachment = {
  wordId: string;
  imageUrl: string;
  comment: string;
};

export type ForkNode = {
  id: string;
  parentId: string | null;
  applicationId: string;
  changesets: Changeset[];
  attachments: InspoAttachment[];
  children: string[];
};

export type InspoState = {
  wordId: string;
  text: string;
  images: string[];
} | null;

export type SearchResult = {
  featureId: string;
  matchText: string;
  context: string;
};

export type WorkbenchProps = {
  applications: Record<string, Application>;
  features: Feature[];
  initialFeatureId: string;
  onInspoRequest: (text: string) => Promise<string[]>;
  onForkRequest: (currentState: ForkNode) => Promise<Application>;
  onSearch: (query: string, applicationId: string) => Promise<SearchResult[]>;
};
