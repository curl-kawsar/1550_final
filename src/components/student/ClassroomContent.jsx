'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Unlock, 
  Play, 
  Book, 
  Clock, 
  CheckCircle, 
  Star,
  ShoppingCart,
  Users,
  Target,
  X
} from 'lucide-react';
import { toast } from "sonner";
import Link from 'next/link';
import { useVideoProgress } from '@/hooks/useVideoProgress';

const ClassroomContent = forwardRef((props, ref) => {
  const [classroomData, setClassroomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  // Hook for automatic video progress tracking
  const videoWithMetadata = playingVideo ? {
    ...playingVideo,
    moduleId: selectedModule?._id,
    structureId: classroomData?.classStructures?.find(s => 
      s.modules?.some(m => m._id === selectedModule?._id)
    )?._id
  } : null;

  const { markVideoCompleted: autoMarkCompleted } = useVideoProgress(
    videoWithMetadata, 
    () => {
      fetchClassroomContent(); // Refresh data when video is auto-completed
    }
  );

  useEffect(() => {
    fetchClassroomContent();
  }, []);

  // Add periodic refresh for recent payments to handle webhook delays
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = urlParams.get('payment') === 'success';
    
    if (isPaymentSuccess) {
      // Try manual completion first (fallback for webhook issues)
      attemptManualCompletion();
      
      // Check every 3 seconds for up to 30 seconds after payment
      let retryCount = 0;
      const maxRetries = 10;
      
      const checkPaymentStatus = setInterval(() => {
        retryCount++;
        
        // Stop after max retries
        if (retryCount >= maxRetries) {
          clearInterval(checkPaymentStatus);
          return;
        }
        
        // Refresh content to check if payment has been processed
        fetchClassroomContent();
        
        // Clear interval if we find access granted
        if (classroomData?.hasAccess) {
          clearInterval(checkPaymentStatus);
        }
      }, 3000);
      
      // Cleanup interval on unmount
      return () => clearInterval(checkPaymentStatus);
    }
  }, [classroomData?.hasAccess]);

  const attemptManualCompletion = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) return;

      const response = await fetch('/api/student/complete-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Manual payment completion:', data);
        
        // Refresh classroom content immediately
        setTimeout(() => {
          fetchClassroomContent();
        }, 1000);
      }
    } catch (error) {
      console.error('Error with manual payment completion:', error);
    }
  };

  // Refresh classroom data (exposed for parent components)
  const refreshClassroomData = () => {
    setLoading(true);
    fetchClassroomContent();
  };

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refreshClassroomData
  }));

  const fetchClassroomContent = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        toast.error('Please log in to access classroom content');
        return;
      }

      const response = await fetch('/api/student/classroom', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch classroom content');
      }

      setClassroomData(data);
    } catch (error) {
      console.error('Error fetching classroom content:', error);
      toast.error(error.message || 'Failed to load classroom content');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = (video) => {
    // Only allow playing if video is unlocked
    if (!video.isUnlocked) {
      toast.error('Complete the previous video to unlock this one');
      return;
    }
    setPlayingVideo(video);
  };

  const markVideoCompleted = async (video) => {
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
          moduleId: selectedModule._id,
          structureId: classroomData.classStructures.find(s => 
            s.modules.some(m => m._id === selectedModule._id)
          )?._id
        })
      });

      // Refresh classroom data to get updated unlock status
      await fetchClassroomContent();
      toast.success('🎉 Video completed! Next video unlocked.');
    } catch (error) {
      console.error('Error marking video as completed:', error);
      toast.error('Failed to mark video as completed');
    }
  };

  const getNextVideo = () => {
    if (!playingVideo || !selectedModule) return null;

    const currentModule = selectedModule;
    const currentVideoIndex = currentModule.videos.findIndex(v => v._id === playingVideo._id);
    
    // Check if there's a next video in the current module
    if (currentVideoIndex < currentModule.videos.length - 1) {
      const nextVideo = currentModule.videos[currentVideoIndex + 1];
      // Only return if it's unlocked
      if (nextVideo.isUnlocked) {
        return nextVideo;
      }
    }
    
    // If no next video in current module, check next module
    const currentStructure = classroomData.classStructures.find(s => 
      s.modules.some(m => m._id === selectedModule._id)
    );
    
    if (currentStructure) {
      const currentModuleIndex = currentStructure.modules.findIndex(m => m._id === selectedModule._id);
      if (currentModuleIndex < currentStructure.modules.length - 1) {
        const nextModule = currentStructure.modules[currentModuleIndex + 1];
        // Get first video of next module if it's unlocked
        if (nextModule.videos && nextModule.videos.length > 0 && nextModule.videos[0].isUnlocked) {
          return { video: nextModule.videos[0], module: nextModule };
        }
      }
    }
    
    return null;
  };

  const handleNextVideo = () => {
    const nextItem = getNextVideo();
    if (nextItem) {
      if (nextItem.module) {
        // Switch to next module and play first video
        setSelectedModule(nextItem.module);
        setPlayingVideo(nextItem.video);
      } else {
        // Play next video in current module
        setPlayingVideo(nextItem);
      }
    } else {
      toast.info('Complete the current video to unlock the next one!');
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(selectedModule?._id === module._id ? null : module);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!classroomData) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Classroom Content Available
          </h3>
          <p className="text-gray-500">
            Course materials will appear here once they're available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    classStructures = [], 
    hasAccess = false, 
    paymentStatus = 'pending', 
    studentInfo = {} 
  } = classroomData || {};

  if (!hasAccess && classStructures.some(cs => cs.requiresPayment)) {
    return (
      <div className="space-y-6">
        {/* Simple Purchase Section */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              SAT 1550+ Course
            </CardTitle>
            <p className="text-gray-600">
              Unlock complete access to SAT preparation materials
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Simple Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold">Expert Strategies</h4>
                <p className="text-sm text-gray-600">Proven SAT techniques</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Video Lessons</h4>
                <p className="text-sm text-gray-600">Step-by-step tutorials</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold">1550+ Roadmap</h4>
                <p className="text-sm text-gray-600">Your path to success</p>
              </div>
            </div>
            
            {/* Simple Pricing */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-2xl text-gray-400 line-through">$297</span>
                <span className="text-4xl font-bold text-blue-600">$99</span>
              </div>
              
              <Link href="/special-offer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg rounded-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Purchase Now - $99
                </Button>
              </Link>
              
              {/* Manual completion button for testing */}
              {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('payment') === 'success' && (
                <Button 
                  onClick={attemptManualCompletion}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 font-bold px-8 py-3 w-full mt-3"
                >
                  🔄 Unlock Content (If Payment Completed)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simple Course Preview */}
        {classStructures.map((structure, index) => (
          <Card key={structure._id} className="opacity-75">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {structure.title}
                </CardTitle>
                <Badge variant="outline" className="text-blue-600">
                  Premium
                </Badge>
              </div>
              <p className="text-gray-600">{structure.overview}</p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Content available after purchase</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <div className="w-80 bg-gray-50 text-gray-800 overflow-y-auto border-r border-gray-200 shadow-sm">

        
        <div className="p-1 pt-2">
          {classStructures.map((structure) => (
            <div key={structure._id} className="mb-4">
              <div className="px-1 py-2 text-base font-bold text-gray-700 uppercase tracking-wider bg-white rounded-lg mb-2 shadow-sm">
                {structure.title}
              </div>
              
              {structure.modules?.map((module) => {
                const completedVideos = module.videos?.filter(v => v.isCompleted).length || 0;
                const totalVideos = module.videos?.length || 0;
                const moduleProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
                
                return (
                  <div key={module._id} className="mb-2">
                    <button
                      onClick={() => handleModuleSelect(module)}
                      className={`w-full text-left px-1 py-2 rounded-lg text-lg font-semibold transition-colors ${
                        selectedModule?._id === module._id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'hover:bg-gray-200 text-gray-800 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Book className="w-5 h-5" />
                          {module.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {completedVideos}/{totalVideos}
                          </span>
                          {moduleProgress === 100 && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      {totalVideos > 0 && (
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${moduleProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </button>
                  
                  {/* Sub-videos for expanded module */}
                  {selectedModule?._id === module._id && module.videos?.length > 0 && (
                    <div className="ml-3 mt-1 space-y-1">
                      {module.videos.map((video) => {
                        const isLocked = !video.isUnlocked;
                        const isCompleted = video.isCompleted;
                        const isPlaying = playingVideo?._id === video._id;
                        
                        return (
                          <button
                            key={video._id}
                            onClick={() => handleVideoPlay(video)}
                            disabled={isLocked}
                            className={`w-full text-left px-1 py-2 rounded-lg text-base transition-colors flex items-center gap-2 ${
                              isLocked
                                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                                : isPlaying
                                ? 'bg-blue-500 text-white shadow-md'
                                : isCompleted
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'hover:bg-gray-100 text-gray-700 bg-white'
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            <span className={`flex-1 ${isLocked ? 'line-through' : ''}`}>
                              {video.title}
                            </span>
                            {video.watchedPercentage > 0 && video.watchedPercentage < 100 && (
                              <Badge variant="secondary" className="text-xs">
                                {video.watchedPercentage}%
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
              
              {(!structure.modules || structure.modules.length === 0) && (
                <div className="px-1 py-2 text-base text-gray-500 bg-white rounded-lg">
                  No modules available yet
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Video Player */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {playingVideo ? (
          <>
            {/* Video Title Bar */}
            <div className="bg-white border-b px-8 py-6">
              <h1 className="text-3xl font-bold text-gray-900">{playingVideo.title}</h1>
              {playingVideo.description && (
                <p className="text-gray-600 mt-2 text-lg">{playingVideo.description}</p>
              )}
            </div>
            
            {/* Video Content */}
            <div className="flex-1 bg-white p-8">
              <div className="max-w-4xl mx-auto">
                <div 
                  className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg"
                  dangerouslySetInnerHTML={{ __html: playingVideo.embedCode }}
                />
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-lg text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{playingVideo.duration || 'Duration not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      <span>Video Lesson</span>
                    </div>
                    {playingVideo.isCompleted && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!playingVideo.isCompleted && (
                      <Button 
                        onClick={() => markVideoCompleted(playingVideo)}
                        className="text-lg px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                    {getNextVideo() && (
                      <Button 
                        onClick={handleNextVideo}
                        className="text-lg px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                        title={`Next: ${getNextVideo().video ? getNextVideo().video.title : getNextVideo().title}`}
                      >
                        Next Video
                        <Play className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setPlayingVideo(null)}
                      className="text-lg px-6 py-3"
                    >
                      Close Video
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome/No Video Selected State */
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-lg">
              <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-14 h-14 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Your SAT Course!
              </h2>
              <p className="text-gray-600 mb-6 text-xl">
                Select a module from the sidebar to start learning. Complete videos to unlock the next ones!
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-lg text-green-600 bg-green-50 px-6 py-4 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                  <span>Premium Access Activated</span>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">📚 How it works:</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• First video in each module is always unlocked</p>
                    <p>• Complete a video to unlock the next one</p>
                    <p>• Track your progress with completion badges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ClassroomContent.displayName = 'ClassroomContent';

export default ClassroomContent;

