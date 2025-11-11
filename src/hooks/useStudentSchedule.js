import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Fetch student's current schedule and change counts
export const useStudentSchedule = () => {
  return useQuery({
    queryKey: ['studentSchedule'],
    queryFn: async () => {
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('/api/student/schedule', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Mutation for changing schedule
export const useChangeSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ changeType, newValue }) => {
      const token = localStorage.getItem('studentToken');

      const response = await fetch('/api/student/schedule', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changeType,
          newValue
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update schedule');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      const scheduleType = variables.changeType === 'classTime' ? 'class time' : 'diagnostic test';
      toast.success(`Successfully updated your ${scheduleType}!`);
      
      // Invalidate and refetch the schedule data
      queryClient.invalidateQueries({ queryKey: ['studentSchedule'] });
      
      // Also invalidate student profile data if it includes schedule info
      queryClient.invalidateQueries({ queryKey: ['currentStudent'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update schedule');
    },
  });
};