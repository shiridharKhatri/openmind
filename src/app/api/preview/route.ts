import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let urlString: string | null = null;
  try {
    const { searchParams } = new URL(req.url);
    urlString = searchParams.get('url');

    if (!urlString) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(urlString);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the URL content with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: response.status });
    }

    const html = await response.text();

    // Helper to extract meta tag content
    const getMetaTag = (htmlText: string, propertyOrName: string): string => {
      // Matches both property="..." and name="..."
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${propertyOrName}["'][^>]*content=["']([^"']*)["']`,
        'i'
      );
      const match = htmlText.match(regex);
      if (match) return match[1];

      // Reverse attributes order check (content before property/name)
      const reverseRegex = new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${propertyOrName}["']`,
        'i'
      );
      const reverseMatch = htmlText.match(reverseRegex);
      return reverseMatch ? reverseMatch[1] : '';
    };

    // Extract Title
    let title = getMetaTag(html, 'og:title') || getMetaTag(html, 'twitter:title');
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = titleMatch ? titleMatch[1] : targetUrl.hostname;
    }

    // Extract Description
    const description =
      getMetaTag(html, 'og:description') ||
      getMetaTag(html, 'twitter:description') ||
      getMetaTag(html, 'description');

    // Extract Image
    let image = getMetaTag(html, 'og:image') || getMetaTag(html, 'twitter:image');
    if (image && !image.startsWith('http')) {
      // Resolve relative image URLs
      image = new URL(image, targetUrl.origin).toString();
    }

    const cleanString = (str: string) => {
      if (!str) return '';
      return str
        .replace(/[\u2014\u2013]/g, ' - ') // Replace em-dash and en-dash with standard hyphen
        .replace(/\s*-\s*/g, ' - ') // Normalize spacing around hyphens
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    };

    return NextResponse.json({
      title: cleanString(title),
      description: cleanString(description),
      image,
      url: targetUrl.toString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`Link preview fetch skipped for ${urlString || 'unknown'}: ${msg}`);
    return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
  }
}
