'use client';

import { useState } from 'react';
import { ChatContainer } from '@/components/chat-container';
import { VideoPopup } from '@/components/video-popup';

export default function Home() {
  const [showVideo, setShowVideo] = useState(true);

  return (
    <>
      {showVideo && <VideoPopup onClose={() => setShowVideo(false)} />}
      <ChatContainer />
    </>
  );
}
