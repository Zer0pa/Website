import { visit } from 'unist-util-visit';
import { extractInlinePaths, extractSectionTexts, getNodeText, normalizeWhitespace, uniqObjects } from './shared';

export function extractProofAnchors(ast: any, repoUrl: string, markdown = '') {
  const proofAnchors: Array<{
    label: string;
    path: string;
    repoUrl: string;
    description: string;
  }> = [];

  const pushAnchor = (label: string, path: string, description?: string) => {
    const cleanPath = normalizeWhitespace(path).replace(/^(?:\.\.\/|\.\/)+/g, '');
    if (!cleanPath || /^mailto:/i.test(cleanPath)) {
      return;
    }

    if (!/\.md$|\.json$|\.cff$|\.txt$|\.yaml$|\.yml$|\.csv$|\.ipynb$|\.pdf$/i.test(cleanPath)) {
      return;
    }

    if (!/(proof|audit|evidence|benchmark|manifest|status|report|limits|packet|readiness|playbook|architecture|reruns?|artifacts?)/i.test(cleanPath)) {
      return;
    }

    proofAnchors.push({
      label: normalizeWhitespace(label) || cleanPath,
      path: cleanPath,
      repoUrl: `${repoUrl}/blob/main/${cleanPath}`,
      description: normalizeWhitespace(description || label || cleanPath),
    });
  };

  visit(ast, (node: any) => {
    if (node.type === 'link') {
      const label = getNodeText(node);
      const url = node.url || '';
      if (url && !/^https?:\/\//i.test(url)) {
        pushAnchor(label, url, label);
      }
    }

    if (node.type === 'inlineCode') {
      const value = normalizeWhitespace(node.value || '');
      if (value && value.includes('/')) {
        pushAnchor(value, value, value);
      }
    }
  });

  const sections = extractSectionTexts(markdown, [
    /Proof Anchors/i,
    /Evidence Routes/i,
    /Verification Path/i,
    /Audit Routes/i,
    /Current Authority/i,
    /Authority State/i,
    /Release Readiness/i,
  ]);

  for (const section of sections) {
    for (const path of extractInlinePaths(section.body)) {
      pushAnchor(path, path, section.heading);
    }

    for (const line of section.body.split(/\r?\n/)) {
      const text = normalizeWhitespace(line);
      if (!text) continue;

      const codePath = text.match(/`([^`]+\.[a-z0-9]+)`/i)?.[1];
      if (codePath) {
        pushAnchor(codePath, codePath, section.heading);
      }

      const markdownLink = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (markdownLink && !/^https?:\/\//i.test(markdownLink[2])) {
        pushAnchor(markdownLink[1], markdownLink[2], section.heading);
      }
    }
  }

  return uniqObjects(proofAnchors, anchor => anchor.path);
}
