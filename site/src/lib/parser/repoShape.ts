import { visit } from 'unist-util-visit';
import { extractInlinePaths, extractSectionTexts, getNodeText, normalizeWhitespace, uniqObjects } from './shared';

export function extractRepoShape(ast: any, markdown = '') {
  const repoShape: Array<{
    path: string;
    description: string;
  }> = [];

  const pushShape = (path: string, description: string) => {
    const cleanPath = normalizeWhitespace(path);
    if (!cleanPath) return;
    repoShape.push({
      path: cleanPath,
      description: normalizeWhitespace(description) || cleanPath,
    });
  };

  visit(ast, (node: any) => {
    if (node.type === 'listItem') {
      const text = getNodeText(node);
      const pathMatch = text.match(/`([^`]+)`/);
      if (pathMatch) {
        pushShape(pathMatch[1], text.replace(/`[^`]+`[:\s-]*/, ''));
      }
    }

    if (node.type === 'link' && node.url && !/^https?:\/\//i.test(node.url)) {
      pushShape(node.url, getNodeText(node));
    }
  });

  const sections = extractSectionTexts(markdown, [/Repo Shape/i, /Repository Structure/i, /Directory Layout/i, /Project Layout/i]);
  for (const section of sections) {
    for (const path of extractInlinePaths(section.body)) {
      pushShape(path, section.heading);
    }

    for (const line of section.body.split(/\r?\n/)) {
      const text = normalizeWhitespace(line);
      const pathMatch = text.match(/`([^`]+)`/);
      if (pathMatch) {
        pushShape(pathMatch[1], text.replace(/`[^`]+`[:\s-]*/, ''));
      }
    }
  }

  return uniqObjects(repoShape, item => item.path);
}
