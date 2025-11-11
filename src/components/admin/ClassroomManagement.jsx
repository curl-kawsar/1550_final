'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Play,
  Book,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Video,
  Upload
} from 'lucide-react';
import { toast } from "sonner";

const ClassroomManagement = () => {
  const [classStructures, setClassStructures] = useState([]);
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('structures');
  
  // Form states
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form data
  const [structureForm, setStructureForm] = useState({
    title: '',
    overview: '',
    description: '',
    requiresPayment: true,
    sortOrder: 0
  });
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    classStructure: '',
    duration: '',
    objectives: [],
    sortOrder: 0
  });
  
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    embedCode: '',
    module: '',
    duration: '',
    thumbnailUrl: '',
    sortOrder: 0
  });

  const [expandedStructures, setExpandedStructures] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [structuresRes, modulesRes, videosRes] = await Promise.all([
        fetch('/api/class-structures', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/modules', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/videos', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      if (structuresRes.ok) {
        const structuresData = await structuresRes.json();
        setClassStructures(structuresData.classStructures || []);
      }

      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.modules || []);
      }

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData.videos || []);
      }
    } catch (error) {
      console.error('Error fetching classroom data:', error);
      toast.error('Failed to load classroom data');
    } finally {
      setLoading(false);
    }
  };

  // Class Structure Functions
  const handleCreateStructure = async () => {
    try {
      const response = await fetch('/api/class-structures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(structureForm)
      });

      if (response.ok) {
        const data = await response.json();
        setClassStructures(prev => [...prev, data.classStructure]);
        setShowStructureForm(false);
        setStructureForm({
          title: '',
          overview: '',
          description: '',
          requiresPayment: true,
          sortOrder: 0
        });
        toast.success('Class structure created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create class structure');
      }
    } catch (error) {
      console.error('Error creating structure:', error);
      toast.error('Failed to create class structure');
    }
  };

  const handleUpdateStructure = async (id) => {
    try {
      const response = await fetch(`/api/class-structures/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(structureForm)
      });

      if (response.ok) {
        const data = await response.json();
        setClassStructures(prev => prev.map(s => s._id === id ? data.classStructure : s));
        setEditingItem(null);
        setStructureForm({
          title: '',
          overview: '',
          description: '',
          requiresPayment: true,
          sortOrder: 0
        });
        toast.success('Class structure updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update class structure');
      }
    } catch (error) {
      console.error('Error updating structure:', error);
      toast.error('Failed to update class structure');
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!confirm('Are you sure? This will delete all associated modules and videos.')) return;

    try {
      const response = await fetch(`/api/class-structures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setClassStructures(prev => prev.filter(s => s._id !== id));
        setModules(prev => prev.filter(m => m.classStructure?._id !== id));
        setVideos(prev => prev.filter(v => v.module?.classStructure !== id));
        toast.success('Class structure deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete class structure');
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast.error('Failed to delete class structure');
    }
  };

  // Module Functions
  const handleCreateModule = async () => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...moduleForm,
          objectives: moduleForm.objectives.filter(obj => obj.trim() !== '')
        })
      });

      if (response.ok) {
        const data = await response.json();
        setModules(prev => [...prev, data.module]);
        setShowModuleForm(false);
        setModuleForm({
          title: '',
          description: '',
          classStructure: '',
          duration: '',
          objectives: [],
          sortOrder: 0
        });
        toast.success('Module created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    }
  };

  // Video Functions
  const handleCreateVideo = async () => {
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(videoForm)
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(prev => [...prev, data.video]);
        setShowVideoForm(false);
        setVideoForm({
          title: '',
          description: '',
          embedCode: '',
          module: '',
          duration: '',
          thumbnailUrl: '',
          sortOrder: 0
        });
        toast.success('Video created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create video');
      }
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video');
    }
  };

  const toggleStructureExpansion = (structureId) => {
    setExpandedStructures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(structureId)) {
        newSet.delete(structureId);
      } else {
        newSet.add(structureId);
      }
      return newSet;
    });
  };

  const getModulesForStructure = (structureId) => {
    return modules.filter(m => m.classStructure?._id === structureId);
  };

  const getVideosForModule = (moduleId) => {
    return videos.filter(v => v.module?._id === moduleId);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-6 h-6" />
            Classroom Content Management
          </CardTitle>
          <p className="text-gray-600">
            Manage class structures, modules, and videos for the student classroom.
          </p>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'structures'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Class Structures
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Complete Overview
        </button>
      </div>

      {activeTab === 'structures' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setShowStructureForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Class Structure
            </Button>
            <Button
              onClick={() => setShowModuleForm(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={classStructures.length === 0}
            >
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
            <Button
              onClick={() => setShowVideoForm(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={modules.length === 0}
            >
              <Plus className="w-4 h-4" />
              Add Video
            </Button>
          </div>

          {/* Class Structures List */}
          <div className="space-y-4">
            {classStructures.map((structure) => (
              <Card key={structure._id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStructureExpansion(structure._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedStructures.has(structure._id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {structure.title}
                          {structure.isActive ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          {structure.requiresPayment && (
                            <Badge variant="outline" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{structure.overview}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getModulesForStructure(structure._id).length} modules
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(structure._id);
                          setStructureForm({
                            title: structure.title,
                            overview: structure.overview,
                            description: structure.description || '',
                            requiresPayment: structure.requiresPayment,
                            sortOrder: structure.sortOrder
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteStructure(structure._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedStructures.has(structure._id) && (
                  <CardContent className="pt-0">
                    <div className="ml-6 space-y-3">
                      {getModulesForStructure(structure._id).map((module) => (
                        <div key={module._id} className="border-l-2 border-l-gray-200 pl-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Book className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{module.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {getVideosForModule(module._id).length} videos
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-6 mt-2 space-y-1">
                            {getVideosForModule(module._id).map((video) => (
                              <div key={video._id} className="flex items-center gap-2 text-sm text-gray-600">
                                <Play className="w-3 h-3" />
                                <span>{video.title}</span>
                                {video.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    {video.duration}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {classStructures.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Class Structures Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first class structure to start organizing your content.
                  </p>
                  <Button onClick={() => setShowStructureForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class Structure
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{classStructures.length}</div>
                  <div className="text-sm text-gray-600">Class Structures</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{modules.length}</div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{videos.length}</div>
                  <div className="text-sm text-gray-600">Total Videos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forms - Class Structure */}
      {(showStructureForm || editingItem) && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Class Structure' : 'Create New Class Structure'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={structureForm.title}
                onChange={(e) => setStructureForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., SAT Math Mastery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Overview</label>
              <Textarea
                value={structureForm.overview}
                onChange={(e) => setStructureForm(prev => ({ ...prev, overview: e.target.value }))}
                placeholder="Brief overview of this class structure"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={structureForm.description}
                onChange={(e) => setStructureForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description (optional)"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={structureForm.requiresPayment}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, requiresPayment: e.target.checked }))}
                />
                Requires Payment
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <Input
                  type="number"
                  value={structureForm.sortOrder}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingItem ? () => handleUpdateStructure(editingItem) : handleCreateStructure}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowStructureForm(false);
                  setEditingItem(null);
                  setStructureForm({
                    title: '',
                    overview: '',
                    description: '',
                    requiresPayment: true,
                    sortOrder: 0
                  });
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms - Module */}
      {showModuleForm && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle>Create New Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class Structure</label>
              <select
                value={moduleForm.classStructure}
                onChange={(e) => setModuleForm(prev => ({ ...prev, classStructure: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Class Structure</option>
                {classStructures.map((structure) => (
                  <option key={structure._id} value={structure._id}>
                    {structure.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Module Title</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Linear Equations"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Module description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                value={moduleForm.duration}
                onChange={(e) => setModuleForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 2 hours"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateModule}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Module
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModuleForm(false);
                  setModuleForm({
                    title: '',
                    description: '',
                    classStructure: '',
                    duration: '',
                    objectives: [],
                    sortOrder: 0
                  });
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms - Video */}
      {showVideoForm && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Create New Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select
                value={videoForm.module}
                onChange={(e) => setVideoForm(prev => ({ ...prev, module: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.classStructure?.title} - {module.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Video Title</label>
              <Input
                value={videoForm.title}
                onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Solving Linear Equations - Part 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Embed Code</label>
              <Textarea
                value={videoForm.embedCode}
                onChange={(e) => setVideoForm(prev => ({ ...prev, embedCode: e.target.value }))}
                placeholder="Paste the complete embed code (iframe) here"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Video description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                value={videoForm.duration}
                onChange={(e) => setVideoForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 15 minutes"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateVideo}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVideoForm(false);
                  setVideoForm({
                    title: '',
                    description: '',
                    embedCode: '',
                    module: '',
                    duration: '',
                    thumbnailUrl: '',
                    sortOrder: 0
                  });
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassroomManagement;
