import { X } from 'lucide-react';

interface VideoPopupProps {
  onClose: () => void;
}

export function VideoPopup({ onClose }: VideoPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src="https://www.tella.tv/video/cm87wmuur000a0bla4feyg0ol/embed?b=1&title=1&a=1&loop=0&t=0&muted=0&wt=1"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
