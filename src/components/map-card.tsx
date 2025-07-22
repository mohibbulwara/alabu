
'use client';

import { Card } from './ui/card';

interface MapCardProps {
  address: string;
}

export default function MapCard({ address }: MapCardProps) {
  // Increased zoom level from 13 to 15 for a closer view.
  // Using iwloc=B places a marker at the location.
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    address
  )}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

  return (
    <Card className="overflow-hidden relative aspect-video md:aspect-[2.4/1] w-full border-4 border-primary/20 shadow-lg">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapSrc}
        title={`Map of ${address}`}
        aria-label={`Map of ${address}`}
      ></iframe>
    </Card>
  );
}
