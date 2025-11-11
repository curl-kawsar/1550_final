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
  Target
} from 'lucide-react';
import { toast } from "sonner";
import Link from 'next/link';

const ClassroomContent = forwardRef((props, ref) => {
  const [classroomData, setClassroomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

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
    setPlayingVideo(video);
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
        {/* Access Denied Section */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
              <CardTitle className="text-2xl text-orange-800">Premium Content Locked</CardTitle>
            </div>
            <p className="text-orange-700">
              Unlock exclusive SAT preparation content by purchasing our special offer!
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800">Expert Strategies</h4>
                <p className="text-sm text-gray-600">Proven techniques to boost your SAT score</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800">Video Lessons</h4>
                <p className="text-sm text-gray-600">Step-by-step video tutorials</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800">1550+ Roadmap</h4>
                <p className="text-sm text-gray-600">Your path to scoring 1550+</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Special Limited Time Offer!</h3>
              <p className="text-lg mb-4">Get complete access for just <strong>$497</strong> (84% OFF)</p>
              <div className="space-y-3">
                <Link href="/special-offer">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 w-full">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Purchase Now - $497
                  </Button>
                </Link>
                
                {/* Manual completion button for testing (when payment=success is in URL) */}
                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('payment') === 'success' && (
                  <Button 
                    onClick={attemptManualCompletion}
                    className="bg-yellow-500 text-white hover:bg-yellow-600 font-bold px-8 py-3 w-full"
                  >
                    🔄 Unlock Content (If Payment Completed)
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Content */}
        {classStructures.map((structure) => (
          <Card key={structure._id} className="opacity-75">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                  {structure.title}
                </CardTitle>
                <Badge variant="outline" className="border-orange-300 text-orange-600">
                  Premium Content
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{structure.overview}</p>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Content available after purchase</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Welcome to Your Classroom, {studentInfo?.name || 'Student'}!
          </CardTitle>
          <p className="text-gray-600">
            You have full access to all premium content. Start your journey to 1550+!
          </p>
        </CardHeader>
      </Card>

      {/* Video Player Section */}
      {playingVideo && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              {playingVideo.title}
            </CardTitle>
            {playingVideo.description && (
              <p className="text-gray-600">{playingVideo.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div 
              className="w-full bg-black rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: playingVideo.embedCode }}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{playingVideo.duration || 'Duration not specified'}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPlayingVideo(null)}
              >
                Close Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      {classStructures.map((structure) => (
        <Card key={structure._id} className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-green-500" />
              {structure.title}
            </CardTitle>
            <p className="text-gray-600">{structure.overview}</p>
            {structure.description && (
              <p className="text-sm text-gray-500">{structure.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {structure.modules?.map((module) => (
                <div key={module._id} className="border rounded-lg">
                  <button
                    onClick={() => handleModuleSelect(module)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{module.title}</h4>
                          {module.description && (
                            <p className="text-sm text-gray-600">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.videos?.length > 0 && (
                          <Badge variant="outline">
                            {module.videos.length} videos
                          </Badge>
                        )}
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                  
                  {selectedModule?._id === module._id && module.videos?.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {module.videos.map((video) => (
                          <button
                            key={video._id}
                            onClick={() => handleVideoPlay(video)}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all text-left"
                          >
                            <Play className="w-8 h-8 text-blue-500 bg-blue-50 p-2 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{video.title}</h5>
                              {video.duration && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {video.duration}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedModule?._id === module._id && (!module.videos || module.videos.length === 0) && (
                    <div className="border-t bg-gray-50 p-4 text-center text-gray-500">
                      No videos available in this module yet.
                    </div>
                  )}
                </div>
              ))}
              
              {(!structure.modules || structure.modules.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No modules available yet. Content will be added soon!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

ClassroomContent.displayName = 'ClassroomContent';

export default ClassroomContent;
