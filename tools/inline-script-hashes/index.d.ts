export function listHtmlFiles(directory: string): string[];
export function hashesForHtml(html: string): string[];
export function collectHashes(exportDirectory: string): string[];
export function applyHashes(policy: string, hashes: string[]): string;
