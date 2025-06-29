import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, X } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url: string): string | null => {
    try {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match && match[1] ? match[1] : null;
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
      return null;
    }
  };

  // Helper function to get YouTube thumbnail from video URL
  const getYouTubeThumbnail = (videoUrl: string): string => {
    try {
      const videoId = extractYouTubeVideoId(videoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400';
    } catch (error) {
      console.error('Error extracting YouTube thumbnail:', error);
      return 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  };

  // Handle playing a video in the modal
  const handlePlayVideo = (videoUrl: string) => {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      setCurrentVideoId(videoId);
      setShowVideoModal(true);
    } else {
      // Fallback to opening in new tab if video ID can't be extracted
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setCurrentVideoId(null);
  };

  useEffect(() => {
    const mockTutorials: Tutorial[] = [
      {
        id: '1',
        title: 'Getting Started with Nanatech',
        description: 'Learn the basics of using voice commands to set reminders and navigate the app',
        videoUrl: 'https://www.youtube.com/watch?v=d2pg8gLS9mg',
        thumbnail: getYouTubeThumbnail('https://www.youtube.com/watch?v=d2pg8gLS9mg'),
        duration: '3:45',
      },
      {
        id: '2',
        title: 'How to Pay Meralco Bills Online',
        description: 'Step-by-step guide to paying your electricity bills through Meralco online',
        videoUrl: 'https://www.youtube.com/watch?v=abd5LJs0SKY',
        thumbnail: getYouTubeThumbnail('https://www.youtube.com/watch?v=abd5LJs0SKY'),
        duration: '8:30',
      },
      {
        id: '3',
        title: 'How to Pay Globe Mobile Bills',
        description: 'Easy tutorial for paying your Globe mobile and internet bills online',
        videoUrl: 'https://www.youtube.com/watch?v=ZoMgBNWmjYM',
        thumbnail: getYouTubeThumbnail('https://www.youtube.com/watch?v=ZoMgBNWmjYM'),
        duration: '6:15',
      },
      {
        id: '4',
        title: 'How to Pay PLDT Bills Online',
        description: 'Complete guide to paying your PLDT landline and internet bills through their website',
        videoUrl: 'https://www.youtube.com/watch?v=W8P3FabIozo',
        thumbnail: getYouTubeThumbnail('https://www.youtube.com/watch?v=W8P3FabIozo'),
        duration: '7:20',
      },
      {
        id: '5',
        title: 'Setting Medicine Reminders',
        description: 'How to set up medication reminders effectively using voice commands',
        videoUrl: 'https://youtube.com/watch?v=example5',
        // Keep Pexels thumbnail for placeholder video
        thumbnail: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400',
        duration: '4:10',
      },
    ];
    setTutorials(mockTutorials);
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-text dark:text-dark-primary-text mb-4">Learn & Get Help</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text text-lg">
          Watch these tutorials to get the most out of Nanatech and learn how to pay bills online
        </p>
      </div>

      <div className="space-y-4">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl overflow-hidden hover:border-accent-pink/30 transition-colors"
          >
            <div className="flex">
              <div className="relative w-40 h-28 flex-shrink-0">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a reliable placeholder if thumbnail fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <button
                  onClick={() => handlePlayVideo(tutorial.videoUrl)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors group cursor-pointer"
                >
                  <Play className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                  {tutorial.duration}
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <h3 className="font-bold text-primary-text dark:text-dark-primary-text mb-2 text-lg">{tutorial.title}</h3>
                <p className="text-base text-secondary-text dark:text-dark-secondary-text mb-4">{tutorial.description}</p>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePlayVideo(tutorial.videoUrl)}
                    className="inline-flex items-center space-x-2 text-accent-pink hover:text-accent-pink/80 text-base font-semibold transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    <span>Watch Video</span>
                  </button>
                  
                  <a
                    href={tutorial.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text text-base transition-colors"
                  >
                    <span>Open in YouTube</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary-bg dark:bg-dark-secondary-bg rounded-xl p-8 border border-primary-border dark:border-dark-primary-border">
        <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-4">Need More Help?</h3>
        <p className="text-secondary-text dark:text-dark-secondary-text mb-6 text-base">
          Contact our support team if you need additional assistance with the app or paying bills online.
        </p>
        <div className="space-y-3 text-base">
          <p className="text-secondary-text dark:text-dark-secondary-text">
            <span className="font-semibold">Email:</span> support@nanatech.today
          </p>
          <p className="text-secondary-text dark:text-dark-secondary-text">
            <span className="font-semibold">Phone:</span> 1-800-NANATECH
          </p>
          <p className="text-secondary-text dark:text-dark-secondary-text">
            <span className="font-semibold">Hours:</span> Monday - Sunday, 24/7
          </p>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideoId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 text-white hover:text-accent-pink text-xl font-bold bg-black/50 rounded-full p-3 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Video container with responsive aspect ratio */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Tutorial Video"
                className="absolute inset-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Background click to close */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={closeVideoModal}
          />
        </div>
      )}
    </div>
  );
}