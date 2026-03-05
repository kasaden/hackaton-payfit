import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServerComponentClient } from "@/lib/supabase/server";
import {
  Star,
  CheckCircle,
  ChevronRight,
  FileText,
  Calendar,
  Receipt,
  Calculator,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FeaturesCarousel } from "@/components/article/FeaturesCarousel";
import { RelatedArticles } from "@/components/article/RelatedArticles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://payfit-seo-copilot.vercel.app";

// --- METADATA DYNAMIQUE ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerComponentClient();
  const { data: article } = await supabase
	.from("articles")
	.select("title, meta_description, keyword_primary, keywords_secondary, published_at, updated_at")
	.eq("slug", slug)
	.single();

  if (!article) {
	return { title: "Article introuvable" };
  }

  const keywords = [
	article.keyword_primary,
	...(article.keywords_secondary || []),
  ].filter(Boolean);

  return {
	title: `${article.title} | PayFit SEO Copilot`,
	description: article.meta_description || article.title,
	keywords,
	alternates: {
	  canonical: `${SITE_URL}/articles/${slug}`,
	},
	openGraph: {
	  title: article.title,
	  description: article.meta_description || article.title,
	  type: "article",
	  locale: "fr_FR",
	  url: `${SITE_URL}/articles/${slug}`,
	  siteName: "PayFit SEO Copilot",
	  publishedTime: article.published_at || undefined,
	  modifiedTime: article.updated_at || undefined,
	  authors: ["PayFit"],
	},
	twitter: {
	  card: "summary_large_image",
	  title: article.title,
	  description: article.meta_description || article.title,
	},
	robots: {
	  index: true,
	  follow: true,
	},
  };
}

// --- HELPERS ---

/** Découpe le contenu markdown en sections basées sur les H2 */
function splitByH2(content: string): string[] {
  const sections: string[] = [];
  const lines = content.split("\n");
  let current: string[] = [];

  for (const line of lines) {
	if (line.startsWith("## ") && current.length > 0) {
	  sections.push(current.join("\n"));
	  current = [];
	}
	current.push(line);
  }
  if (current.length > 0) sections.push(current.join("\n"));
  return sections;
}

/** Bloc Trustpilot */
function TrustpilotBlock() {
  return (
	<div className="my-12 bg-[#152330] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
	  <div className="space-y-2">
		<h3 className="text-2xl font-bold">
		  Rejoignez plus de 20 000 TPE et PME
		</h3>
		<p className="text-gray-300">
		  PayFit est noté <strong className="text-white">4.5/5</strong>{" "}
		  sur Trustpilot.
		</p>
	  </div>
	  <div className="flex flex-col items-center shrink-0">
		<div className="flex gap-1 mb-2">
		  {[1, 2, 3, 4, 5].map((i) => (
			<div
			  key={i}
			  className="w-8 h-8 bg-[#00B67A] flex items-center justify-center rounded-sm"
			>
			  <Star className="w-5 h-5 text-white fill-white" />
			</div>
		  ))}
		</div>
		<span className="text-sm font-medium">TrustScore 4.5</span>
	  </div>
	</div>
  );
}

/** Bloc CTA quiz + démo */
function CtaBlock() {
  return (
	<div className="my-12 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
	  <h3 className="text-xl font-semibold text-gray-900 mb-2">
		Vous souhaitez automatiser votre paie ?
	  </h3>
	  <p className="text-gray-600 mb-6">
		PayFit intègre automatiquement les évolutions légales 2026.
	  </p>
	  <div className="flex flex-col sm:flex-row gap-3 justify-center">
		<Link href="/quiz">
		  <Button className="bg-[#0066CC] hover:bg-[#004C99] text-white cursor-pointer h-11 px-6">
			Testez votre conformité paie
		  </Button>
		</Link>
		<a
		  href="https://payfit.com/fr/demo/"
		  target="_blank"
		  rel="noopener noreferrer"
		>
		  <Button
			variant="outline"
			className="cursor-pointer h-11 px-6"
		  >
			Demander une démo PayFit
		  </Button>
		</a>
	  </div>
	</div>
  );
}

// --- PARSEUR MARKDOWN BASIQUE ---
// Rend le texte avec gras (**text**), liens [texte](url) de manière sûre via React (pas de dangerouslySetInnerHTML)

/** Parse les liens markdown [texte](url) dans un segment de texte */
function InlineLinks({ text }: { text: string }) {
  // Split on markdown links: [text](url)
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return (
	<>
	  {parts.map((part, i) => {
		const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
		if (linkMatch) {
		  const [, linkText, url] = linkMatch;
		  // Internal links use Next.js Link, external links use <a>
		  const isInternal = url.startsWith("/");
		  if (isInternal) {
			return (
			  <Link key={i} href={url} className="text-[#0066CC] hover:underline font-medium">
				{linkText}
			  </Link>
			);
		  }
		  return (
			<a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[#0066CC] hover:underline font-medium">
			  {linkText}
			</a>
		  );
		}
		return <span key={i}>{part}</span>;
	  })}
	</>
  );
}

/** Parse le gras (**text**) et délègue les liens à InlineLinks */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
	<>
	  {parts.map((part, i) =>
		part.startsWith("**") && part.endsWith("**") ? (
		  <strong key={i}><InlineLinks text={part.slice(2, -2)} /></strong>
		) : (
		  <InlineLinks key={i} text={part} />
		)
	  )}
	</>
  );
}

// Transforme le texte de l'IA en composants React stylisés avec des ancres (id) pour le sommaire
function MarkdownRenderer({ content }: { content: string }) {
  return (
	<div className="prose prose-blue max-w-none text-gray-700">
	  {content.split("\n").map((line, i) => {
		// Titre H1
		if (line.startsWith("# ")) return null; // Géré dans le Hero

		// Titre H2
		if (line.startsWith("## ")) {
		  const text = line.slice(3);
		  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
		  return (
			<h2
			  key={i}
			  id={id}
			  className="text-2xl font-bold mt-12 mb-6 text-[#152330] scroll-mt-24"
			>
			  <InlineText text={text} />
			</h2>
		  );
		}

		// Titre H3
		if (line.startsWith("### ")) {
		  return (
			<h3
			  key={i}
			  className="text-xl font-semibold mt-8 mb-4 text-[#152330]"
			>
			  <InlineText text={line.slice(4)} />
			</h3>
		  );
		}

		// Liste à puces
		if (line.startsWith("- ")) {
		  return (
			<li key={i} className="ml-6 mb-2 list-disc pl-2">
			  <InlineText text={line.slice(2)} />
			</li>
		  );
		}

		// Sauts de ligne
		if (line.trim() === "") return <div key={i} className="h-4" />;

		// Paragraphes normaux
		return (
		  <p key={i} className="mb-4 leading-relaxed text-[17px]">
			<InlineText text={line} />
		  </p>
		);
	  })}
	</div>
  );
}

// --- PAGE PRINCIPALE ---
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. LA CORRECTION DU 404 EST ICI : Await params pour Next.js 15+
  const { slug } = await params;

  const supabase = await createServerComponentClient();

  // Vérifier si l'utilisateur est connecté
  const {
	data: { user },
  } = await supabase.auth.getUser();

  // Chercher l'article par slug
  const { data: article } = await supabase
	.from("articles")
	.select("*")
	.eq("slug", slug)
	.single();

  if (!article) {
	notFound();
  }

  // Si l'article est un brouillon, seuls les utilisateurs connectés peuvent le voir
  if (!article.is_published && !user) {
	notFound();
  }

  // 2. Extraire les titres H2 pour construire le Sommaire
  const h2Regex = /^##\s+(.+)$/gm;
  const sommaire: { id: string; text: string }[] = [];
  let match;
  while ((match = h2Regex.exec(article.content_markdown)) !== null) {
	const text = match[1];
	sommaire.push({
	  id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
	  text: text.replace(/\*\*/g, ""),
	});
  }

  // 3. Structured Data JSON-LD
  const articleUrl = `${SITE_URL}/articles/${slug}`;

  const articleJsonLd = {
	"@context": "https://schema.org",
	"@type": "Article",
	headline: article.title,
	description: article.meta_description || article.title,
	url: articleUrl,
	datePublished: article.published_at || article.created_at,
	dateModified: article.updated_at || article.published_at || article.created_at,
	wordCount: article.word_count,
	inLanguage: "fr",
	author: {
	  "@type": "Organization",
	  name: "PayFit",
	  url: "https://payfit.com",
	},
	publisher: {
	  "@type": "Organization",
	  name: "PayFit",
	  url: "https://payfit.com",
	  logo: {
		"@type": "ImageObject",
		url: `${SITE_URL}/logo-seo-copilot.png`,
	  },
	},
	mainEntityOfPage: {
	  "@type": "WebPage",
	  "@id": articleUrl,
	},
	keywords: [
	  article.keyword_primary,
	  ...(article.keywords_secondary || []),
	].filter(Boolean).join(", "),
	articleSection: "Conseils RH & Paie",
	about: {
	  "@type": "Thing",
	  name: article.keyword_primary || article.title,
	},
  };

  const breadcrumbJsonLd = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
	  {
		"@type": "ListItem",
		position: 1,
		name: "Accueil",
		item: SITE_URL,
	  },
	  {
		"@type": "ListItem",
		position: 2,
		name: "Articles",
		item: `${SITE_URL}/dashboard`,
	  },
	  {
		"@type": "ListItem",
		position: 3,
		name: article.title,
		item: articleUrl,
	  },
	],
  };

  const organizationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "PayFit",
	url: "https://payfit.com",
	logo: `${SITE_URL}/logo-seo-copilot.png`,
	description: "Solution de gestion de la paie et des RH pour les TPE et PME.",
	sameAs: [
	  "https://www.linkedin.com/company/payfit",
	  "https://twitter.com/PayFit",
	],
  };

  // 4. Extract FAQ entries from markdown for FAQPage JSON-LD
  const faqEntries: { question: string; answer: string }[] = [];
  const faqSectionMatch = article.content_markdown.match(/##\s*(?:FAQ|Questions fréquentes)([\s\S]*?)(?=\n##\s[^#]|$)/i);
  if (faqSectionMatch) {
	const faqContent = faqSectionMatch[1];
	// Match ### Question ? followed by answer lines
	const questionBlocks = faqContent.split(/###\s+/).filter(Boolean);
	for (const block of questionBlocks) {
	  const lines = block.split('\n').filter((l: string) => l.trim() !== '');
	  if (lines.length >= 2) {
		const question = lines[0].replace(/\*\*/g, '').replace(/\??\s*$/, '?').trim();
		const answer = lines.slice(1)
		  .map((l: string) => l.replace(/^\*\*[QR]:\*\*\s*/, '').replace(/^[QR]:\s*/, '').replace(/\*\*/g, '').trim())
		  .filter(Boolean)
		  .join(' ');
		if (question && answer) {
		  faqEntries.push({ question, answer });
		}
	  }
	}
  }

  const faqJsonLd = faqEntries.length > 0 ? {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: faqEntries.map((faq) => ({
	  "@type": "Question",
	  name: faq.question,
	  acceptedAnswer: {
		"@type": "Answer",
		text: faq.answer,
	  },
	})),
  } : null;

  return (
	<div className="min-h-screen bg-white">
	  {/* JSON-LD Structured Data */}
	  <script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
	  />
	  <script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
	  />
	  <script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
	  />
	  {faqJsonLd && (
		<script
		  type="application/ld+json"
		  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
		/>
	  )}

	  {/* Header original conservé */}
	  <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
		<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
		  <Link href="/" className="flex items-center gap-2">
			<Image
			  src="/logo-seo-copilot.png"
			  alt="Logo"
			  width={28}
			  height={28}
			  className="rounded-lg"
			/>
			<span className="font-semibold text-sm">
			  PayFit <span className="text-[#0066CC]">SEO Copilot</span>
			</span>
		  </Link>
		  <Link href="/quiz">
			<Button variant="outline" size="sm" className="cursor-pointer">
			  Testez votre conformité
			</Button>
		  </Link>
		</div>
	  </header>

	  {/* Navigation / Breadcrumb style PayFit */}
	  <div className="bg-[#F4F7F9] py-4 border-b border-gray-200">
		<div className="max-w-6xl mx-auto px-4 lg:px-8 text-sm text-gray-500 flex items-center gap-2">
		  <Link
			href="/"
			className="hover:text-[#0066CC] flex items-center gap-1"
		  >
			<ArrowLeft className="w-3 h-3" /> Accueil
		  </Link>
		  <ChevronRight className="w-4 h-4" />
		  <Link href="/dashboard" className="hover:text-[#0066CC]">
			Articles
		  </Link>
		  <ChevronRight className="w-4 h-4" />
		  <span className="text-gray-900 truncate">{article.title}</span>
		</div>
	  </div>

	  {/* Hero Section */}
	  <div className="bg-[#F4F7F9] pt-12 pb-16">
		<div className="max-w-4xl mx-auto px-4 lg:px-8 text-center space-y-6">
		  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-[#0066CC] rounded-full text-sm font-medium">
			<FileText className="w-4 h-4" />
			Conseils RH & Paie
		  </div>
		  <h1 className="text-4xl md:text-5xl font-extrabold text-[#152330] tracking-tight leading-tight">
			{article.title}
		  </h1>
		  {article.meta_description && (
			<p className="text-lg text-gray-600 max-w-2xl mx-auto">
			  {article.meta_description}
			</p>
		  )}
		  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 pt-4">
			<span className="flex items-center gap-1">
			  <Calendar className="w-4 h-4" />
			  {article.published_at
				? new Date(article.published_at).toLocaleDateString("fr-FR", {
					year: "numeric",
					month: "long",
					day: "numeric",
				  })
				: "Brouillon"}
			</span>
			<span>•</span>
			<span>{Math.ceil(article.word_count / 250)} min de lecture</span>
			<span>•</span>
			<span className="font-medium text-gray-900">
			  Par les experts PayFit
			</span>
		  </div>
		</div>
	  </div>

	  {/* Contenu principal (Grid : Sommaire + Article) */}
	  <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
		<div className="flex flex-col lg:flex-row gap-12">
		  {/* COLONNE GAUCHE : Sommaire (Sticky) */}
		  <div className="hidden lg:block w-1/4">
			<div className="sticky top-24 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
			  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
				Sommaire
			  </h3>
			  <nav className="flex flex-col gap-3">
				{sommaire.map((item, index) => (
				  <a
					key={index}
					href={`#${item.id}`}
					className="text-sm text-gray-600 hover:text-[#0066CC] hover:translate-x-1 transition-transform"
				  >
					{item.text}
				  </a>
				))}
			  </nav>
			</div>
		  </div>

		  {/* COLONNE DROITE : Contenu intercalé avec les blocs */}
		  <div className="w-full lg:w-3/4">
			{(() => {
			  const sections = splitByH2(article.content_markdown);

			  // Blocs à intercaler après chaque section (par index)
			  const interleaved: Record<number, React.ReactNode> = {
				0: <TrustpilotBlock key="trustpilot" />,
				1: <FeaturesCarousel key="carousel" />,
				2: (
				  <RelatedArticles
					key="related"
					currentArticleId={article.id}
					currentTrendId={article.trend_id}
					currentTitle={article.title}
					currentKeywordPrimary={article.keyword_primary || ""}
					currentKeywordsSecondary={article.keywords_secondary || []}
				  />
				),
				3: <CtaBlock key="cta" />,
			  };

			  // Indices de blocs non encore placés (si < 4 sections)
			  const placedIndices = new Set(
				Object.keys(interleaved)
				  .map(Number)
				  .filter((i) => i < sections.length)
			  );
			  const remaining = Object.entries(interleaved)
				.filter(([i]) => !placedIndices.has(Number(i)))
				.sort(([a], [b]) => Number(a) - Number(b))
				.map(([, node]) => node);

			  return (
				<>
				  {sections.map((section, i) => (
					<div key={i}>
					  <MarkdownRenderer content={section} />
					  {interleaved[i] ?? null}
					</div>
				  ))}
				  {remaining}
				</>
			  );
			})()}

			{/* Compliance disclaimer */}
			<aside className="mt-16 pt-8 border-t border-gray-200">
			  <p className="text-xs text-gray-400 leading-relaxed">
				Cet article est fourni à titre informatif et ne constitue pas un
				conseil juridique. Les informations sont à jour à la date de
				publication
				{article.published_at &&
				  ` (${new Date(article.published_at).toLocaleDateString("fr-FR", {
					year: "numeric",
					month: "long",
					day: "numeric",
				  })})`}
				. Pour toute question relative à votre situation spécifique,
				consultez un professionnel du droit social ou votre expert-comptable.
			  </p>
			</aside>
		  </div>
		</div>
	  </div>
	</div>
  );
}
