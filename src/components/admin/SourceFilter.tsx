import { Button } from "@/components/ui/button";
import { Facebook, Globe, Instagram, Monitor, Search } from "lucide-react";

interface SourceFilterProps {
  sources: string[];
  selectedSource: string | null;
  onSelectSource: (source: string | null) => void;
}

const getSourceIcon = (source: string) => {
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') {
    return <Facebook className="w-4 h-4" />;
  }
  if (lower.includes('instagram') || lower === 'ig') {
    return <Instagram className="w-4 h-4" />;
  }
  if (lower.includes('google')) {
    return <Search className="w-4 h-4" />;
  }
  if (lower === 'direct' || lower === 'direto') {
    return <Monitor className="w-4 h-4" />;
  }
  return <Globe className="w-4 h-4" />;
};

const getSourceLabel = (source: string): string => {
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') return 'Facebook';
  if (lower.includes('instagram') || lower === 'ig') return 'Instagram';
  if (lower.includes('google')) return 'Google';
  if (lower === 'direct' || lower === 'direto') return 'Direto';
  if (lower.includes('tiktok')) return 'TikTok';
  return source || 'Outro';
};

const SourceFilter = ({ sources, selectedSource, onSelectSource }: SourceFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedSource === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectSource(null)}
      >
        <Globe className="w-4 h-4 mr-1" />
        Todos
      </Button>
      {sources.slice(0, 6).map((source) => (
        <Button
          key={source}
          variant={selectedSource === source ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectSource(source)}
        >
          {getSourceIcon(source)}
          <span className="ml-1">{getSourceLabel(source)}</span>
        </Button>
      ))}
    </div>
  );
};

export default SourceFilter;
