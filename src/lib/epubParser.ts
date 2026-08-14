import JSZip from 'jszip';
import { Book } from '../types';

export interface ParsedEpub {
  title: string;
  author: string;
  chapters: { title: string; content: string }[];
  coverImage?: string;
}

/**
 * Clean HTML string into structured readable text for EReaderModal
 */
function cleanChapterHtml(htmlContent: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove script and style elements
    const scriptsAndStyles = doc.querySelectorAll('script, style, link, head');
    scriptsAndStyles.forEach(el => el.remove());

    // Extract text paragraphs and headers cleanly
    const body = doc.body;
    if (!body) return htmlContent.replace(/<[^>]+>/g, ' ').trim();

    // Convert headings and paragraphs into clean formatted text blocks
    const blocks: string[] = [];
    const elements = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, div');

    if (elements.length > 0) {
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          // Avoid repeating nested container texts
          if (!blocks.some(b => b.includes(text) && b.length === text.length)) {
            blocks.push(text);
          }
        }
      });
    }

    if (blocks.length > 0) {
      return blocks.join('\n\n');
    }

    // Fallback if no specific tags found
    return body.textContent?.replace(/\n\s*\n/g, '\n\n').trim() || '';
  } catch (e) {
    return htmlContent.replace(/<[^>]+>/g, ' ').trim();
  }
}

/**
 * Creates a beautiful SVG Data URL cover image for custom EPUB uploads
 */
export function generateCoverDataUrl(title: string, author: string): string {
  const safeTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
  const safeAuthor = author.length > 25 ? author.substring(0, 25) + '...' : author;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#451a03" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" rx="16" fill="url(#grad)" />
    <rect x="20" y="20" width="360" height="560" rx="12" fill="none" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="8 4" />
    
    <!-- Pattern Motif -->
    <circle cx="200" cy="180" r="60" fill="#f59e0b" fill-opacity="0.1" />
    <path d="M 200 130 L 220 170 L 260 180 L 220 190 L 200 230 L 180 190 L 140 180 L 180 170 Z" fill="url(#gold)" />
    
    <!-- Title -->
    <text x="200" y="320" font-family="sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" width="320">
      <tspan x="200" dy="0">${safeTitle}</tspan>
    </text>
    
    <!-- Divider -->
    <line x1="120" y1="380" x2="280" y2="380" stroke="#f59e0b" stroke-width="2" />
    
    <!-- Author -->
    <text x="200" y="420" font-family="sans-serif" font-weight="600" font-size="16" fill="#f59e0b" text-anchor="middle">
      ${safeAuthor}
    </text>
    
    <!-- Footer Tag -->
    <rect x="130" y="500" width="140" height="28" rx="14" fill="#f59e0b" fill-opacity="0.2" />
    <text x="200" y="519" font-family="sans-serif" font-weight="800" font-size="11" fill="#fcd34d" text-anchor="middle" letter-spacing="1">
      E-BOOK EPUB
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Parses an EPUB file buffer into structured book data
 */
export async function parseEpubFile(file: File): Promise<Book> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let title = file.name.replace(/\.epub$/i, '').replace(/_/g, ' ');
  let author = 'Autor Desconhecido';
  let opfPath = '';

  // Step 1: Find container.xml to locate content.opf
  const containerFile = zip.file('META-INF/container.xml');
  if (containerFile) {
    const containerXml = await containerFile.async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = doc.querySelector('rootfile');
    if (rootfile) {
      opfPath = rootfile.getAttribute('full-path') || '';
    }
  }

  // Step 2: Read metadata and spine from OPF if available
  const chapterFiles: { path: string; title: string }[] = [];

  if (opfPath && zip.file(opfPath)) {
    const opfContent = await zip.file(opfPath)!.async('string');
    const parser = new DOMParser();
    const opfDoc = parser.parseFromString(opfContent, 'text/xml');

    // Title & Author metadata
    const titleEl = opfDoc.querySelector('dc\\:title, title');
    if (titleEl && titleEl.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }

    const creatorEl = opfDoc.querySelector('dc\\:creator, creator');
    if (creatorEl && creatorEl.textContent?.trim()) {
      author = creatorEl.textContent.trim();
    }

    // Manifest items mapping id -> href
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    const manifestItems = new Map<string, string>();
    const items = opfDoc.querySelectorAll('manifest > item');
    items.forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        manifestItems.set(id, opfDir + href);
      }
    });

    // Spine items reading order
    const itemrefs = opfDoc.querySelectorAll('spine > itemref');
    itemrefs.forEach((ref, idx) => {
      const idref = ref.getAttribute('idref');
      if (idref && manifestItems.has(idref)) {
        const fullPath = manifestItems.get(idref)!;
        chapterFiles.push({
          path: fullPath,
          title: `Capítulo ${idx + 1}`
        });
      }
    });
  }

  // Fallback: If OPF parsing yielded no chapters, search ZIP for html/xhtml files
  if (chapterFiles.length === 0) {
    const allFiles = Object.keys(zip.files);
    const htmlPaths = allFiles.filter(path => 
      !path.startsWith('META-INF') && 
      !path.endsWith('.opf') && 
      (path.endsWith('.html') || path.endsWith('.xhtml') || path.endsWith('.htm') || path.endsWith('.xml'))
    ).sort();

    htmlPaths.forEach((path, idx) => {
      chapterFiles.push({
        path,
        title: `Capítulo ${idx + 1}`
      });
    });
  }

  // Step 3: Extract chapter content from ZIP files
  const parsedChapters: { title: string; content: string }[] = [];

  for (let i = 0; i < chapterFiles.length; i++) {
    const ch = chapterFiles[i];
    // try exact path or decoded path
    let zipFile = zip.file(ch.path) || zip.file(decodeURIComponent(ch.path));

    // Try without folder prefix if needed
    if (!zipFile) {
      const filename = ch.path.split('/').pop();
      if (filename) {
        const match = Object.keys(zip.files).find(k => k.endsWith(filename));
        if (match) zipFile = zip.file(match);
      }
    }

    if (zipFile) {
      const htmlText = await zipFile.async('string');
      const cleanText = cleanChapterHtml(htmlText);

      // Extract heading title from chapter HTML if available
      let chapterTitle = ch.title;
      try {
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        const h1 = doc.querySelector('h1, h2, title');
        if (h1 && h1.textContent?.trim() && h1.textContent.trim().length < 60) {
          chapterTitle = h1.textContent.trim();
        }
      } catch (e) {
        // use fallback
      }

      if (cleanText.length > 20) {
        parsedChapters.push({
          title: chapterTitle,
          content: cleanText
        });
      }
    }
  }

  // Default chapter if none extracted
  if (parsedChapters.length === 0) {
    parsedChapters.push({
      title: 'Capítulo 1',
      content: `Não foi possível extrair texto formatado do ficheiro EPUB "${file.name}". O ficheiro pode estar protegido com DRM ou conter apenas imagens.`
    });
  }

  // Generate unique ID for custom upload
  const customId = `custom-epub-${Date.now()}`;
  const coverImage = generateCoverDataUrl(title, author);

  const customBook: Book = {
    id: customId,
    title,
    author,
    category: 'E-Book Pessoal',
    description: `Ficheiro EPUB importado pelo utilizador (${(file.size / (1024 * 1024)).toFixed(2)} MB). Suporte completo para leitura offline e tradução no E-Reader Zola Books.`,
    coverImage,
    priceAOA: 0,
    priceUSD: 0,
    rating: 5.0,
    reviewCount: 1,
    publisher: 'Biblioteca Pessoal (Importado)',
    isbn: `EPUB-${Date.now()}`,
    publishedYear: new Date().getFullYear(),
    language: 'Português',
    pageCount: parsedChapters.length * 15,
    isFree: true,
    fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(1)),
    tags: ['EPUB Importado', 'Biblioteca Pessoal', 'Offline'],
    fullContent: {
      chapters: parsedChapters
    },
    sampleContent: {
      chapters: parsedChapters
    }
  };

  return customBook;
}
