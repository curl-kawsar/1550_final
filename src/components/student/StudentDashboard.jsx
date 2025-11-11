"use client"

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StudentChatTab from '@/components/student/StudentChatTab'
import ScheduleManager from '@/components/student/ScheduleManager'
import ParentalApprovalModal from '@/components/student/ParentalApprovalModal'
import BookingWidget from '@/components/student/BookingWidget'
import AssignmentTab from '@/components/student/AssignmentTab'
import ResultsTab from '@/components/student/ResultsTab'
import ClassroomContent from '@/components/student/ClassroomContent'
import { useChatMessages } from '@/hooks/useChat'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  GraduationCap, 
  MapPin, 
  Users, 
  Star,
  BookOpen,
  Target,
  LogOut,
  Settings,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  FileText,
  Trophy,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play
} from 'lucide-react'

export default function StudentDashboard({ student, onLogout, onRefreshStudent }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollContainerRef = useRef(null)
  const classroomContentRef = useRef(null)
  const searchParams = useSearchParams()
  
  // State for dynamic class time and diagnostic test details
  const [classTimeDetails, setClassTimeDetails] = useState(null)
  const [diagnosticTestDetails, setDiagnosticTestDetails] = useState(null)
  const [loadingClassDetails, setLoadingClassDetails] = useState(false)
  const [loadingDiagnosticDetails, setLoadingDiagnosticDetails] = useState(false)
  
  // State for contact info editing
  const [editingContact, setEditingContact] = useState(false)
  const [contactFormData, setContactFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    phoneNumber: student?.phoneNumber || '',
    state: student?.state || '',
    parentFirstName: student?.parentFirstName || '',
    parentLastName: student?.parentLastName || '',
    parentPhoneNumber: student?.parentPhoneNumber || ''
  })
  
  // Check if parental approval is required
  const needsParentalApproval = student?.parentalApprovalStatus !== 'approved'

  // Chat data for notifications - call at top level
  const studentEmail = student?.email;
  const { data: chatData } = useChatMessages(studentEmail, {
    enabled: !!studentEmail,
    refetchInterval: 10000 // Check for new messages every 10 seconds
  });

  const messages = chatData?.messages || [];
  const unreadAdminMessages = messages.filter(
    msg => msg.sender === 'admin' && msg.status !== 'read'
  ).length;

  // Fetch class time details
  useEffect(() => {
    const fetchClassTimeDetails = async () => {
      if (!student?.classTime) return;
      
      setLoadingClassDetails(true);
      try {
        const response = await fetch('/api/class-times/active');
        if (response.ok) {
          const data = await response.json();
          const classTime = data.classTimes?.find(ct => ct.name === student.classTime);
          setClassTimeDetails(classTime);
        }
      } catch (error) {
        console.error('Error fetching class time details:', error);
      } finally {
        setLoadingClassDetails(false);
      }
    };

    fetchClassTimeDetails();
  }, [student?.classTime]);

  // Fetch diagnostic test details
  useEffect(() => {
    const fetchDiagnosticTestDetails = async () => {
      if (!student?.diagnosticTestDate) return;
      
      setLoadingDiagnosticDetails(true);
      try {
        const response = await fetch('/api/diagnostic-tests/active');
        if (response.ok) {
          const data = await response.json();
          const diagnosticTest = data.diagnosticTests?.find(dt => dt.name === student.diagnosticTestDate);
          setDiagnosticTestDetails(diagnosticTest);
        }
      } catch (error) {
        console.error('Error fetching diagnostic test details:', error);
      } finally {
        setLoadingDiagnosticDetails(false);
      }
    };

    fetchDiagnosticTestDetails();
  }, [student?.diagnosticTestDate]);

  // Update contact form data when student changes
  useEffect(() => {
    if (student) {
      setContactFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phoneNumber: student.phoneNumber || '',
        state: student.state || '',
        parentFirstName: student.parentFirstName || '',
        parentLastName: student.parentLastName || '',
        parentPhoneNumber: student.parentPhoneNumber || ''
      });
    }
  }, [student]);

  // Handle URL parameters (e.g., from payment redirect)
  useEffect(() => {
    const payment = searchParams.get('payment');
    const tab = searchParams.get('tab');
    
    if (payment === 'success') {
      toast.success('Payment successful! Welcome to the classroom!', {
        duration: 5000,
        description: 'You now have access to all premium content.'
      });
      // Refresh student data to update payment status
      onRefreshStudent();
      
      // Refresh classroom content to unlock premium features
      // Add a small delay to ensure webhook has processed the payment
      setTimeout(() => {
        if (classroomContentRef.current) {
          classroomContentRef.current.refreshClassroomData();
        }
      }, 2000); // 2 second delay
    }
    
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, onRefreshStudent]);

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefreshStudent()
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  const scrollTabs = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    
    // Refresh classroom content when switching to classroom tab for paid students
    if (tabId === 'classroom' && student?.hasPaidSpecialOffer && classroomContentRef.current) {
      setTimeout(() => {
        classroomContentRef.current.refreshClassroomData();
      }, 500); // Small delay to ensure tab rendering
    }
    setMobileMenuOpen(false)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  // Helper function to format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Helper function to format diagnostic test date
  const formatDiagnosticDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle contact form editing
  const handleContactInputChange = (field, value) => {
    setContactFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = async () => {
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify(contactFormData)
      });

      if (response.ok) {
        setEditingContact(false);
        onRefreshStudent(); // Refresh student data
        // Show success message (you might want to add a toast here)
      } else {
        console.error('Failed to update contact information');
      }
    } catch (error) {
      console.error('Error updating contact information:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingContact(false);
    // Reset form data to original student data
    setContactFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      phoneNumber: student.phoneNumber || '',
      state: student.state || '',
      parentFirstName: student.parentFirstName || '',
      parentLastName: student.parentLastName || '',
      parentPhoneNumber: student.parentPhoneNumber || ''
    });
  };

  // Chat Tab Button with notification badge
  const ChatTabButton = ({ isActive, onClick, icon: Icon, label, unreadCount }) => {
    return (
      <button
        onClick={onClick}
        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 relative ${
          isActive
            ? 'border-[#457BF5] text-[#457BF5]'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </button>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contacted': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'classroom', label: 'Classroom', icon: Play },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'academic', label: 'Academic Info', icon: BookOpen },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'help', label: 'Get Personalized Help', icon: HelpCircle },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-[#457BF5]/5 to-blue-50/50">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-[#457BF5] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                  <span className="text-white font-bold text-lg">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate font-norwester">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-gray-600 font-medium">Student Portal</p>
              </div>
            </div>
            <Button
              onClick={() => setSidebarOpen(false)}
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-gray-100 rounded-xl p-2 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              if (tab.id === 'chat') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 ease-out hover:scale-[1.02] ${
                      isActive
                        ? 'bg-gradient-to-r from-[#457BF5] to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {unreadAdminMessages > 0 && (
                      <div className="relative">
                        <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse shadow-sm">
                          {unreadAdminMessages}
                        </Badge>
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20"></div>
                      </div>
                    )}
                  </button>
                )
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 ease-out hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#457BF5] to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer - Status and Actions */}
          <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-white space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/50 shadow-sm">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</span>
              <Badge className={`${getStatusColor(student.status)} text-xs px-2 py-1 rounded-lg font-medium shadow-sm`}>
                {student.status || 'pending'}
              </Badge>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="w-full flex items-center gap-2 text-xs font-medium rounded-xl border-gray-200/50 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-xs font-medium rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Mobile menu button */}
                <Button
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex items-center gap-1 rounded-xl border-gray-200/50 hover:bg-gray-50 transition-all duration-200"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 font-norwester">
                    {(() => {
                      const activeTabData = tabs.find(tab => tab.id === activeTab)
                      return activeTabData?.label || 'Overview'
                    })()}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Student Dashboard</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <Badge className={`${getStatusColor(student.status)} text-xs sm:text-sm px-3 py-1.5 rounded-xl font-medium shadow-sm`}>
                  {student.status || 'pending'}
                </Badge>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-xl border-gray-200/50 hover:bg-gray-50 transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
              {/* Mobile actions dropdown */}
              <div className="sm:hidden">
                <Button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 rounded-xl border-gray-200/50 hover:bg-gray-50 transition-all duration-200"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* Mobile actions dropdown */}
            {mobileMenuOpen && (
              <div className="sm:hidden border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-white py-3">
                <div className="flex flex-col space-y-3 px-4">
                  <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-gray-200/50 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Status:</span>
                    <Badge className={`${getStatusColor(student.status)} text-xs px-2 py-1 rounded-lg font-medium`}>
                      {student.status || 'pending'}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="flex items-center gap-2 justify-start rounded-xl border-gray-200/50 hover:bg-gray-50 transition-all duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 justify-start rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto bg-gradient-to-br from-gray-50/30 via-white to-blue-50/20">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 font-norwester uppercase tracking-wide">Class Schedule</CardTitle>
                <div className="p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <Clock className="h-5 w-5 text-[#457BF5]" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingClassDetails ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : classTimeDetails ? (
                  <div>
                    <div className="text-lg font-bold text-[#457BF5] font-norwester mb-2">
                      {classTimeDetails.dayOfWeek?.join(' & ') || 'Custom Schedule'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(classTimeDetails.startTime)} - {formatTime(classTimeDetails.endTime)} {classTimeDetails.timezone}
                    </div>
                    {classTimeDetails.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {classTimeDetails.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-400 font-norwester">
                    {student.classTime || 'Not scheduled'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 font-norwester uppercase tracking-wide">Diagnostic Test</CardTitle>
                <div className="p-2 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {loadingDiagnosticDetails ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : diagnosticTestDetails ? (
                  <div>
                    <div className="text-lg font-bold text-green-600 font-norwester mb-2">
                      {formatDiagnosticDate(diagnosticTestDetails.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(diagnosticTestDetails.startTime)} - {formatTime(diagnosticTestDetails.endTime)} {diagnosticTestDetails.timezone}
                    </div>
                    {diagnosticTestDetails.location && diagnosticTestDetails.location !== 'Online' && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {diagnosticTestDetails.location}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-gray-400 font-norwester">
                    {student.diagnosticTestDate ? 
                      (student.diagnosticTestDate.includes('Saturday') ? 'Saturday' : 
                       student.diagnosticTestDate.includes('Sunday') ? 'Sunday' : 'Custom')
                      : 'Not scheduled'
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 font-norwester uppercase tracking-wide">Current GPA</CardTitle>
                <div className="p-2 rounded-xl bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 font-norwester">
                  {student.currentGPA || 'N/A'}
                </div>
              </CardContent>
            </Card>

            {/* Registration Status */}
            <Card className="md:col-span-2 lg:col-span-3 border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 font-norwester">
                  <div className="p-2 rounded-xl bg-purple-50">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  Registration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                    <span className="text-sm font-semibold text-green-800">Registration Submitted</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 px-3 py-1 rounded-lg font-medium">
                      ✓ Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                    <span className="text-sm font-semibold text-blue-800">Class Assignment</span>
                    <Badge className={`${getStatusColor(student.status)} px-3 py-1 rounded-lg font-medium shadow-sm`}>
                      {student.status === 'pending' ? 'In Progress' : 
                       student.status === 'reviewed' ? 'Under Review' : 'Confirmed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200/50">
                    <span className="font-medium">Submitted on:</span> {formatDate(student.submittedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'classroom' && (
          <div className="max-w-7xl mx-auto">
            <ClassroomContent ref={classroomContentRef} />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Current Schedule Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 font-norwester">
                    <div className="p-2 rounded-xl bg-blue-50">
                      <Clock className="h-6 w-6 text-[#457BF5]" />
                    </div>
                    Class Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Selected Time Slot</label>
                    <p className="text-xl font-bold text-[#457BF5] mt-2 font-norwester">
                      {classTimeDetails ? (
                        `${classTimeDetails.dayOfWeek?.join(' & ') || 'Custom'} - ${formatTime(classTimeDetails.startTime)} to ${formatTime(classTimeDetails.endTime)} ${classTimeDetails.timezone}`
                      ) : (
                        student.classTime || 'Not yet assigned'
                      )}
                    </p>
                  </div>
                  {loadingClassDetails ? (
                    <div className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-2xl"></div>
                    </div>
                  ) : classTimeDetails ? (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
                      <h4 className="text-sm font-bold text-gray-800 mb-4 font-norwester uppercase tracking-wide">Class Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">
                            Days: {classTimeDetails.dayOfWeek?.join(', ') || 'Custom Schedule'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">
                            Time: {formatTime(classTimeDetails.startTime)} - {formatTime(classTimeDetails.endTime)} {classTimeDetails.timezone}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {/* <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">
                            Capacity: {classTimeDetails.currentEnrollment || 0}/{classTimeDetails.capacity || 50} Students
                          </span> */}
                        </div>
                        {classTimeDetails.description && (
                          <div className="flex items-start">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-4 mt-2"></span>
                            <span className="font-semibold text-blue-600 uppercase tracking-wide">
                              {classTimeDetails.description}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <div className="space-y-4 text-sm">
                          <div>
                            <div className="font-bold text-gray-700 mb-2">Meeting Link:</div>
                            <a 
                              href="https://us02web.zoom.us/j/8980721475" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                            >
                              https://us02web.zoom.us/j/8980721475
                            </a>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-xl border border-blue-200/50">
                              <div className="font-bold text-gray-700 mb-1">Online Session:</div>
                              <div className="text-blue-600 font-bold">Room 17</div>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-blue-200/50">
                              <div className="font-bold text-gray-700 mb-1">Office Hours:</div>
                              <div className="text-blue-600 font-bold">Room 18</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : student.classTime && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
                      <h4 className="text-sm font-bold text-gray-800 mb-4 font-norwester uppercase tracking-wide">Class Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">Duration: 1 Hour per Session</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">Format: Live Interactive Sessions</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-4"></span>
                          <span className="font-semibold text-blue-600 uppercase tracking-wide">Materials: Provided Digitally</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900 font-norwester">
                    <div className="p-2 rounded-xl bg-green-50">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    Diagnostic Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Test Date</label>
                    <p className="text-xl font-bold text-green-600 mt-2 font-norwester">
                      {diagnosticTestDetails ? (
                        `${formatDiagnosticDate(diagnosticTestDetails.date)} - ${formatTime(diagnosticTestDetails.startTime)} to ${formatTime(diagnosticTestDetails.endTime)} ${diagnosticTestDetails.timezone}`
                      ) : (
                        student.diagnosticTestDate || 'Not scheduled'
                      )}
                    </p>
                  </div>
                  {loadingDiagnosticDetails ? (
                    <div className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-2xl"></div>
                    </div>
                  ) : diagnosticTestDetails ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-6 rounded-2xl border border-green-200/50">
                      <h4 className="font-bold text-green-900 mb-3 font-norwester">Test Information</h4>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">
                            Date: {formatDiagnosticDate(diagnosticTestDetails.date)}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">
                            Time: {formatTime(diagnosticTestDetails.startTime)} - {formatTime(diagnosticTestDetails.endTime)} {diagnosticTestDetails.timezone}
                          </span>
                        </li>
                        {diagnosticTestDetails.duration && (
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                            <span className="font-medium">Duration: {diagnosticTestDetails.duration}</span>
                          </li>
                        )}
                        {diagnosticTestDetails.location && (
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                            <span className="font-medium">Location: {diagnosticTestDetails.location}</span>
                          </li>
                        )}
                        {/* <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">
                            Capacity: {diagnosticTestDetails.currentEnrollment || 0}/{diagnosticTestDetails.capacity || 50} Students
                          </span>
                        </li> */}
                        {diagnosticTestDetails.description && (
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2"></span>
                            <span className="font-medium">{diagnosticTestDetails.description}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : student.diagnosticTestDate && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 p-6 rounded-2xl border border-green-200/50">
                      <h4 className="font-bold text-green-900 mb-3 font-norwester">Test Information</h4>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">Duration: 3.5 hours</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">Format: Full SAT practice test</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          <span className="font-medium">Results: Available within 48 hours</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Schedule Manager Component */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <ScheduleManager />
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current GPA</label>
                    <p className="text-lg font-semibold mt-1">{student.currentGPA || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Graduation Year</label>
                    <p className="text-lg font-semibold mt-1">{formatDate(student.graduationYear)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">High School</label>
                  <p className="text-lg font-semibold mt-1">{student.highSchoolName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Class Rigor</label>
                  <p className="text-lg font-semibold mt-1">{student.classRigor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">University Goal</label>
                  <p className="text-lg font-semibold mt-1">{student.universitiesWant || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  College Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Top College Choices</label>
                  <p className="text-lg mt-1">{student.topCollegeChoices || 'Not specified'}</p>
                </div>
                {student.satActScores && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current SAT/ACT Scores</label>
                    <p className="text-lg mt-1">{student.satActScores}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Student Type</label>
                  <p className="text-lg mt-1">{student.typeOfStudent || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 font-norwester">Contact Information</h2>
              {!editingContact ? (
                <Button 
                  onClick={() => setEditingContact(true)}
                  className="bg-[#457BF5] hover:bg-[#3a6ce0] text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Information
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveContact}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      {editingContact ? (
                        <input
                          type="text"
                          value={contactFormData.firstName}
                          onChange={(e) => handleContactInputChange('firstName', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.firstName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      {editingContact ? (
                        <input
                          type="text"
                          value={contactFormData.lastName}
                          onChange={(e) => handleContactInputChange('lastName', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-lg mt-1 text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      {editingContact ? (
                        <input
                          type="tel"
                          value={contactFormData.phoneNumber}
                          onChange={(e) => handleContactInputChange('phoneNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                          placeholder="(555) 123-4567"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.phoneNumber || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">State</label>
                      {editingContact ? (
                        <input
                          type="text"
                          value={contactFormData.state}
                          onChange={(e) => handleContactInputChange('state', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                          placeholder="California"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.state || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parent/Guardian Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      {editingContact ? (
                        <input
                          type="text"
                          value={contactFormData.parentFirstName}
                          onChange={(e) => handleContactInputChange('parentFirstName', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.parentFirstName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      {editingContact ? (
                        <input
                          type="text"
                          value={contactFormData.parentLastName}
                          onChange={(e) => handleContactInputChange('parentLastName', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.parentLastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-lg mt-1 text-gray-500">{student.parentEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      {editingContact ? (
                        <input
                          type="tel"
                          value={contactFormData.parentPhoneNumber}
                          onChange={(e) => handleContactInputChange('parentPhoneNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#457BF5] focus:outline-none focus:ring-1 focus:ring-[#457BF5]"
                          placeholder="(555) 123-4567"
                        />
                      ) : (
                        <p className="text-lg mt-1">{student.parentPhoneNumber || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {editingContact && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Note:</p>
                  <p>Email addresses cannot be changed for security reasons. If you need to update your email, please contact support.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'help' && (
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-[#457BF5]" />
                  Get Personalized Help
                </CardTitle>
                <p className="text-gray-600">
                  Schedule a one-on-one consultation with our college admission experts
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-lg mb-2">What to Expect:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#457BF5] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Personalized college admission strategy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#457BF5] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Review of your application materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#457BF5] rounded-full mt-2 flex-shrink-0"></div>
                      <span>SAT/ACT test preparation guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#457BF5] rounded-full mt-2 flex-shrink-0"></div>
                      <span>College selection and application timeline</span>
                    </li>
                  </ul>
                </div>
                
                {/* Embedded Booking Widget */}
                <BookingWidget />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="max-w-6xl mx-auto">
            <AssignmentTab student={student} />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="max-w-6xl mx-auto">
            <ResultsTab student={student} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <StudentChatTab student={student} />
          </div>
        )}
        </div>
      </div>

      {/* Parental Approval Modal - shows when approval is needed */}
      {needsParentalApproval && (
        <ParentalApprovalModal 
          student={student} 
          onRefresh={onRefreshStudent}
        />
      )}

      {/* Access Restriction Overlay - dims content when approval is pending */}
      {needsParentalApproval && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-40 pointer-events-none" 
             style={{ backdropFilter: 'blur(2px)' }} />
      )}
    </div>
  )
}