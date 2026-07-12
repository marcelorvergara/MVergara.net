export type CredentialType = 'certification' | 'skill-badge';
export type DateKind = 'valid-through' | 'issued';

export interface Credential {
  name: string;
  type: CredentialType;
  issuer: string;
  date: string;
  dateKind: DateKind;
  credlyUrl: string;
}

export const CERTIFICATIONS: Credential[] = [
  {
    name: 'Associate Cloud Engineer',
    type: 'certification',
    issuer: 'Google Cloud',
    date: 'Sep 2027',
    dateKind: 'valid-through',
    credlyUrl: 'https://www.credly.com/badges/c296ab52-3d25-4f23-b859-7da19be8a9aa/public_url',
  },
  {
    name: 'Cloud Digital Leader',
    type: 'certification',
    issuer: 'Google Cloud',
    date: 'Sep 2027',
    dateKind: 'valid-through',
    credlyUrl: 'https://www.credly.com/badges/9b202731-a735-418f-9fe7-33f4857b0294/public_url',
  },
];

// First 4 entries are the default-visible set, in display order.
export const SKILL_BADGES: Credential[] = [
  {
    name: 'Engineer AI Agents with Agent Development Kit (ADK)',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'May 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/ffe56fd0-d1ab-4d2b-a3e2-a591acf8832b/public_url',
  },
  {
    name: 'Develop GenAI Apps with Gemini and Streamlit',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'May 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/7ac81965-a2e1-4c0b-b531-b13dc5e0c302/public_url',
  },
  {
    name: 'Implement Cloud Security Fundamentals on Google Cloud',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'Jun 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/dc01effa-4bfd-4705-81c9-1daee1bb36e2/public_url',
  },
  {
    name: 'Orchestrate Data Lifecycle Automation with Data Agents',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'May 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/1cc8b60d-ab9f-4d21-80a2-45912ce0c8a2/public_url',
  },
  {
    name: 'Migrate Virtual Machines to Google Cloud',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'May 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/ffefc38a-884b-4154-a214-60e801c3e642/public_url',
  },
  {
    name: 'Configure Federated Connections for BigQuery and Cloud SQL',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'May 2026',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/283f7c1c-e935-4a12-8c47-e20d605cefba/public_url',
  },
  {
    name: 'Build and Deploy a Generative AI Solution Using a RAG Framework',
    type: 'skill-badge',
    issuer: 'Google Cloud',
    date: 'Dec 2024',
    dateKind: 'issued',
    credlyUrl: 'https://www.credly.com/badges/dc72aa11-9195-4d1c-bff1-0f77b8d24a9b/public_url',
  },
];
