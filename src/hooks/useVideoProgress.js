import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useVideoProgress = (video, onVideoCompleted) => {
  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    if (!video) return;

    // Find the iframe/video element in the embed code
    const checkForVideo = () => {
      const iframe = document.querySelector('iframe[src*="youtube.com"], iframe[src*="vimeo.com"], video');
      
      if (iframe && iframe.tagName === 'IFRAME') {
        // For embedded videos (YouTube, Vimeo), we'll track time manually
        startProgressTracking();
      } else if (iframe && iframe.tagName === 'VIDEO') {
        // For HTML5 video elements
        setupVideoListeners(iframe);
      }
    };

    // Check for video element after a short delay
    const timer = setTimeout(checkForVideo, 1000);

    return () => {
      clearTimeout(timer);
      stopProgressTracking();
    };
  }, [video]);

  const startProgressTracking = () => {
    let watchedTime = 0;
    const totalDuration = parseDuration(video.duration);
    
    progressInterval.current = setInterval(() => {
      watchedTime += 5; // Increment by 5 seconds
      
      // Update progress every 30 seconds
      if (watchedTime - lastUpdateTime.current >= 30) {
        updateWatchProgress(watchedTime, totalDuration);
        lastUpdateTime.current = watchedTime;
      }

      // Auto-complete if watched 90% of the video
      const watchedPercentage = (watchedTime / totalDuration) * 100;
      if (watchedPercentage >= 90 && !video.isCompleted) {
        markVideoCompleted();
        stopProgressTracking();
      }
    }, 5000); // Check every 5 seconds
  };

  const setupVideoListeners = (videoElement) => {
    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      
      if (duration > 0) {
        updateWatchProgress(currentTime, duration);
        
        // Auto-complete if watched 90% of the video
        const watchedPercentage = (currentTime / duration) * 100;
        if (watchedPercentage >= 90 && !video.isCompleted) {
          markVideoCompleted();
        }
      }
    };

    const handleEnded = () => {
      if (!video.isCompleted) {
        markVideoCompleted();
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  };

  const updateWatchProgress = async (watchedTime, totalDuration) => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) return;

      await fetch('/api/student/video-progress', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: video._id,
          moduleId: video.moduleId,
          structureId: video.structureId,
          watchedDuration: watchedTime,
          totalDuration: totalDuration
        })
      });
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const markVideoCompleted = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) return;

      await fetch('/api/student/video-progress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: video._id,
          moduleId: video.moduleId,
          structureId: video.structureId
        })
      });

      toast.success('🎉 Video completed! Next video unlocked.');
      onVideoCompleted?.();
    } catch (error) {
      console.error('Error marking video as completed:', error);
    }
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const parseDuration = (durationString) => {
    if (!durationString) return 600; // Default 10 minutes
    
    // Parse duration like "15:30" or "1:05:30"
    const parts = durationString.split(':').reverse();
    let seconds = 0;
    
    if (parts[0]) seconds += parseInt(parts[0], 10); // seconds
    if (parts[1]) seconds += parseInt(parts[1], 10) * 60; // minutes
    if (parts[2]) seconds += parseInt(parts[2], 10) * 3600; // hours
    
    return seconds || 600; // Default to 10 minutes if parsing fails
  };

  return {
    markVideoCompleted: () => markVideoCompleted()
  };
};
