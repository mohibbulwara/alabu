
'use client';

import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const { toast } = useToast();

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'Product link copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // User shared successfully
      } catch (err) {
        // This can happen if the user cancels the share dialog or an error occurs.
        // We will fall back to copying the link.
        console.log('Web Share API failed, falling back to clipboard:', err);
        await copyToClipboard(shareData.url);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      await copyToClipboard(shareData.url);
    }
  };

  return (
    <Button variant="outline" size="lg" onClick={handleShare} className="px-8 py-6">
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
