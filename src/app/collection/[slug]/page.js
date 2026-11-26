import CollectionClient from './CollectionClient';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export const metadata = {
  title: 'Collection | House of Avira',
  description: 'Shop our exclusive collections at House of Avira.',
};

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  return <CollectionClient slug={resolvedParams.slug} />;
}
