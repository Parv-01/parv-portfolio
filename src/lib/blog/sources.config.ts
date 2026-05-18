/**
 * Single source of truth for external blog accounts to aggregate from.
 */

export type ExternalSource =
  | { kind: 'hashnode'; host: string; profileUrl: string; displayName: string }
  | { kind: 'devto'; username: string; profileUrl: string; displayName: string }
  | { kind: 'medium'; username: string; profileUrl: string; displayName: string };

export const EXTERNAL_SOURCES: ExternalSource[] = [
  {
    kind: 'hashnode',
    host: 'parvagarwal.hashnode.dev',
    profileUrl: 'https://hashnode.com/@parvagarwal',
    displayName: '@parvagarwal',
  },
  {
    kind: 'devto',
    username: 'parvagarwal',
    profileUrl: 'https://dev.to/parvagarwal',
    displayName: '@parvagarwal',
  },
  {
    kind: 'medium',
    username: 'agarwalparv',
    profileUrl: 'https://medium.com/@agarwalparv',
    displayName: '@agarwalparv',
  },
];

export function platformDisplayName(kind: ExternalSource['kind']): string {
  switch (kind) {
    case 'hashnode':
      return 'Hashnode';
    case 'devto':
      return 'Dev.to';
    case 'medium':
      return 'Medium';
  }
}
