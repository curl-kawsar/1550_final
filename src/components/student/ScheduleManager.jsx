"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, AlertTriangle, CheckCircle2, History, RefreshCw, Loader2 } from 'lucide-react'
import { useStudentSchedule, useChangeSchedule } from '@/hooks/useStudentSchedule'
import { toast } from 'sonner'

const ScheduleManager = () => {
  const { data: scheduleData, isLoading, error, refetch, isRefetching } = useStudentSchedule()
  const changeScheduleMutation = useChangeSchedule()
  const [activeChangeType, setActiveChangeType] = useState(null)
  const [selectedValue, setSelectedValue] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // Dynamic options state
  const [classTimeOptions, setClassTimeOptions] = useState([])
  const [diagnosticTestOptions, setDiagnosticTestOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState(null)

  // Fetch dynamic options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      setOptionsError(null)
      
      try {
        // Fetch class times and diagnostic tests in parallel
        const [classTimesResponse, diagnosticTestsResponse] = await Promise.all([
          fetch('/api/class-times/active'),
          fetch('/api/diagnostic-tests/active')
        ])

        if (classTimesResponse.ok) {
          const classTimesData = await classTimesResponse.json()
          setClassTimeOptions(classTimesData.classTimes || [])
        } else {
          console.error('Failed to fetch class times')
        }

        if (diagnosticTestsResponse.ok) {
          const diagnosticTestsData = await diagnosticTestsResponse.json()
          setDiagnosticTestOptions(diagnosticTestsData.diagnosticTests || [])
        } else {
          console.error('Failed to fetch diagnostic tests')
        }

      } catch (error) {
        console.error('Error fetching options:', error)
        setOptionsError('Failed to load schedule options')
        
        // Fallback to legacy options if API fails
        setClassTimeOptions([
          {
            name: 'Mon & Wed - 4:00 PM Pacific',
            dayOfWeek: ['Monday', 'Wednesday'],
            startTime: '16:00',
            endTime: '17:00',
            timezone: 'Pacific'
          },
          {
            name: 'Mon & Wed - 7:00 PM Pacific',
            dayOfWeek: ['Monday', 'Wednesday'],
            startTime: '19:00',
            endTime: '20:00',
            timezone: 'Pacific'
          },
          {
            name: 'Tue & Thu - 4:00 PM Pacific',
            dayOfWeek: ['Tuesday', 'Thursday'],
            startTime: '16:00',
            endTime: '17:00',
            timezone: 'Pacific'
          },
          {
            name: 'Tue & Thu - 7:00 PM Pacific',
            dayOfWeek: ['Tuesday', 'Thursday'],
            startTime: '19:00',
            endTime: '20:00',
            timezone: 'Pacific'
          }
        ])
        
        setDiagnosticTestOptions([
          {
            name: 'Saturday September 27th 8:30am - noon PST',
            date: '2024-09-27',
            startTime: '08:30',
            endTime: '12:00',
            timezone: 'PST'
          },
          {
            name: 'Sunday September 28th 8:30am - noon PST',
            date: '2024-09-28',
            startTime: '08:30',
            endTime: '12:00',
            timezone: 'PST'
          },
          {
            name: 'I can\'t make either of these dates (reply below with if neither option works for you)',
            date: null,
            startTime: null,
            endTime: null,
            timezone: null
          }
        ])
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast.success('Schedule data refreshed')
    } finally {
      setTimeout(() => setRefreshing(false), 1000)
    }
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
  }

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
  }

  const handleChangeRequest = (changeType) => {
    if (loadingOptions) {
      toast.error('Please wait while schedule options are loading')
      return
    }
    
    if (!scheduleData?.canChange[changeType]) {
      toast.error(`You have already used all 2 changes for ${changeType === 'classTime' ? 'class time' : 'diagnostic test'}`)
      return
    }
    
    const options = changeType === 'classTime' ? classTimeOptions : diagnosticTestOptions
    if (options.length === 0) {
      toast.error(`No ${changeType === 'classTime' ? 'class times' : 'diagnostic tests'} available`)
      return
    }
    
    setActiveChangeType(changeType)
    setSelectedValue('')
  }

  const handleConfirmChange = () => {
    if (!selectedValue) {
      toast.error('Please select an option')
      return
    }

    if (activeChangeType === 'classTime' && selectedValue === scheduleData?.currentSchedule?.classTime) {
      toast.error('You are already enrolled in this class time')
      return
    }

    if (activeChangeType === 'diagnosticTest' && selectedValue === scheduleData?.currentSchedule?.diagnosticTestDate) {
      toast.error('You are already enrolled in this diagnostic test')
      return
    }

    changeScheduleMutation.mutate({
      changeType: activeChangeType,
      newValue: selectedValue
    }, {
      onSuccess: () => {
        const formattedValue = formatScheduleOption(selectedValue, activeChangeType);
        const scheduleType = activeChangeType === 'classTime' ? 'class time' : 'diagnostic test';
        
        setActiveChangeType(null)
        setSelectedValue('')
        toast.success(`${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} updated to: ${formattedValue}`)
      }
    })
  }

  const handleCancel = () => {
    setActiveChangeType(null)
    setSelectedValue('')
  }

  const formatScheduleOption = (optionName, changeType) => {
    if (!optionName) return 'Not set';
    
    // Find the option details from our loaded options
    const options = changeType === 'classTime' ? classTimeOptions : diagnosticTestOptions;
    const option = options.find(opt => (opt.name || opt) === optionName);
    
    if (option && option.name) {
      // This is a dynamic option with details
      if (changeType === 'classTime') {
        if (option.dayOfWeek && option.startTime && option.endTime) {
          return `${option.dayOfWeek.join(' & ')} - ${formatTime(option.startTime)} to ${formatTime(option.endTime)} ${option.timezone}`;
        }
      } else if (changeType === 'diagnosticTest') {
        if (option.date && option.startTime && option.endTime) {
          return `${formatDiagnosticDate(option.date)} - ${formatTime(option.startTime)} to ${formatTime(option.endTime)} ${option.timezone}`;
        }
      }
    }
    
    // Fallback to original name if we can't find details or format
    return optionName;
  };

  const formatChangeHistory = (history, changeType) => {
    if (!history || history.length === 0) return 'No changes made'
    
    return history.map((change, index) => (
      <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-1">
        <div className="font-medium">Change #{index + 1}</div>
        <div className="space-y-1">
          <div><span className="font-medium">From:</span> {formatScheduleOption(change.from, changeType)}</div>
          <div><span className="font-medium">To:</span> {formatScheduleOption(change.to, changeType)}</div>
          <div><span className="font-medium">Date:</span> {new Date(change.changedAt).toLocaleDateString()}</div>
        </div>
      </div>
    )).slice(-2) // Show only last 2 changes
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load schedule information</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-2"
              disabled={refreshing || isRefetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
              {(refreshing || isRefetching) ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { currentSchedule, changeCounts, canChange, changeHistory } = scheduleData

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
          <p className="text-sm text-gray-600">Manage your class time and diagnostic test schedule</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing || isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
          {(refreshing || isRefetching) ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Class Time Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Class Time
            <Badge variant={canChange.classTime ? "default" : "secondary"} className="ml-auto">
              {changeCounts.classTime}/2 changes used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Schedule:</div>
            <div className="font-medium text-blue-900">
              {formatScheduleOption(currentSchedule.classTime, 'classTime')}
            </div>
          </div>

          {activeChangeType === 'classTime' ? (
            <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="text-sm font-medium text-blue-900">Select new class time:</div>
              {loadingOptions ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-blue-600">Loading class times...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {classTimeOptions.map((classTime) => (
                    <label key={classTime.name || classTime} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <input
                        type="radio"
                        name="classTime"
                        value={classTime.name || classTime}
                        checked={selectedValue === (classTime.name || classTime)}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className={selectedValue === (classTime.name || classTime) ? 'text-blue-600 font-medium' : ''}>
                          {classTime.dayOfWeek ? (
                            <div>
                              <div className="font-semibold">
                                {classTime.dayOfWeek.join(' & ')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatTime(classTime.startTime)} - {formatTime(classTime.endTime)} {classTime.timezone}
                              </div>
                              {classTime.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {classTime.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>{classTime.name || classTime}</span>
                          )}
                        </div>
                      </div>
                      {(classTime.name || classTime) === currentSchedule.classTime && (
                        <Badge variant="outline" className="ml-auto">Current</Badge>
                      )}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleConfirmChange}
                  disabled={!selectedValue || changeScheduleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {changeScheduleMutation.isPending ? 'Updating...' : 'Confirm Change'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {loadingOptions ? (
                  <span className="text-blue-600">Loading available options...</span>
                ) : optionsError ? (
                  <span className="text-orange-600">⚠️ {optionsError}</span>
                ) : canChange.classTime ? (
                  <span className="text-green-600">✓ You can change your class time {2 - changeCounts.classTime} more time(s)</span>
                ) : (
                  <span className="text-red-600">✗ No more changes available</span>
                )}
              </div>
              <Button 
                onClick={() => handleChangeRequest('classTime')}
                disabled={!canChange.classTime || loadingOptions}
                variant={canChange.classTime && !loadingOptions ? "default" : "secondary"}
                size="sm"
              >
                {loadingOptions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : canChange.classTime ? 'Change Class Time' : 'Changes Used Up'}
              </Button>
            </div>
          )}

          {changeCounts.classTime > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                <History className="w-4 h-4" />
                View Change History
              </summary>
              <div className="mt-2 space-y-1">
                {formatChangeHistory(changeHistory.classTime, 'classTime')}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Diagnostic Test
            <Badge variant={canChange.diagnosticTest ? "default" : "secondary"} className="ml-auto">
              {changeCounts.diagnosticTest}/2 changes used
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Schedule:</div>
            <div className="font-medium text-green-900">
              {formatScheduleOption(currentSchedule.diagnosticTestDate, 'diagnosticTest')}
            </div>
          </div>

          {activeChangeType === 'diagnosticTest' ? (
            <div className="space-y-4 p-4 border-2 border-green-200 rounded-lg bg-green-50">
              <div className="text-sm font-medium text-green-900">Select new diagnostic test date:</div>
              {loadingOptions ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                  <span className="text-green-600">Loading diagnostic tests...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {diagnosticTestOptions.map((diagnosticTest) => (
                    <label key={diagnosticTest.name || diagnosticTest} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <input
                        type="radio"
                        name="diagnosticTest"
                        value={diagnosticTest.name || diagnosticTest}
                        checked={selectedValue === (diagnosticTest.name || diagnosticTest)}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="mr-3 mt-1 text-green-600"
                      />
                      <div className="flex-1">
                        <div className={selectedValue === (diagnosticTest.name || diagnosticTest) ? 'text-green-600 font-medium' : ''}>
                          {diagnosticTest.date ? (
                            <div>
                              <div className="font-semibold">
                                {formatDiagnosticDate(diagnosticTest.date)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatTime(diagnosticTest.startTime)} - {formatTime(diagnosticTest.endTime)} {diagnosticTest.timezone}
                              </div>
                              {diagnosticTest.location && (
                                <div className="text-xs text-gray-500 mt-1">
                                  📍 {diagnosticTest.location}
                                </div>
                              )}
                              {diagnosticTest.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {diagnosticTest.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>{diagnosticTest.name || diagnosticTest}</span>
                          )}
                        </div>
                      </div>
                      {(diagnosticTest.name || diagnosticTest) === currentSchedule.diagnosticTestDate && (
                        <Badge variant="outline" className="ml-auto">Current</Badge>
                      )}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleConfirmChange}
                  disabled={!selectedValue || changeScheduleMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {changeScheduleMutation.isPending ? 'Updating...' : 'Confirm Change'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {loadingOptions ? (
                  <span className="text-blue-600">Loading available options...</span>
                ) : optionsError ? (
                  <span className="text-orange-600">⚠️ {optionsError}</span>
                ) : canChange.diagnosticTest ? (
                  <span className="text-green-600">✓ You can change your diagnostic test {2 - changeCounts.diagnosticTest} more time(s)</span>
                ) : (
                  <span className="text-red-600">✗ No more changes available</span>
                )}
              </div>
              <Button 
                onClick={() => handleChangeRequest('diagnosticTest')}
                disabled={!canChange.diagnosticTest || loadingOptions}
                variant={canChange.diagnosticTest && !loadingOptions ? "default" : "secondary"}
                size="sm"
              >
                {loadingOptions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : canChange.diagnosticTest ? 'Change Test Date' : 'Changes Used Up'}
              </Button>
            </div>
          )}

          {changeCounts.diagnosticTest > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                <History className="w-4 h-4" />
                View Change History
              </summary>
              <div className="mt-2 space-y-1">
                {formatChangeHistory(changeHistory.diagnosticTest, 'diagnosticTest')}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-orange-900 mb-1">Important Notice</div>
              <p className="text-orange-800">
                You can only change your class time and diagnostic test date up to 2 times each. 
                Please choose carefully as changes cannot be undone once you reach the limit.
              </p>
              {optionsError && (
                <p className="text-orange-800 mt-2">
                  <strong>Note:</strong> Schedule options are currently showing fallback data. 
                  Some newer class times or tests may not be available.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Options Info */}
      {!optionsError && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">Dynamic Schedule Options</div>
                <p className="text-blue-800">
                  The class times and diagnostic test dates shown are managed by your instructors 
                  and automatically updated. You'll always see the most current available options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ScheduleManager