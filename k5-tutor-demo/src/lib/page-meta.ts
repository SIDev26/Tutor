export function pageMeta(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | K-5 Tutor` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | K-5 Tutor` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}


