import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Fetch chat messages for a conversation
export const useChatMessages = (studentEmail, options = {}) => {
  return useQuery({
    queryKey: ['chatMessages', studentEmail],
    queryFn: async () => {
      if (!studentEmail) throw new Error('Student email is required');
      
      const response = await fetch(`/api/chat/messages?studentEmail=${encodeURIComponent(studentEmail)}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!studentEmail,
    refetchInterval: 5000, // Reduced frequency to 5 seconds to prevent excessive API calls
    ...options
  });
};

// Send a chat message
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ message, sender, studentEmail, adminName }) => {
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sender === 'student' && token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message,
          sender,
          studentEmail,
          adminName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch messages for this conversation
      queryClient.invalidateQueries(['chatMessages', variables.studentEmail]);
      
      // Also invalidate conversations list for admin
      queryClient.invalidateQueries(['chatConversations']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });
};

// Fetch all conversations for admin
export const useChatConversations = () => {
  return useQuery({
    queryKey: ['chatConversations'],
    queryFn: async () => {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json();
    },
    refetchInterval: 8000 // Poll every 8 seconds for admin conversations
  });
};

// Mark messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentEmail, sender }) => {
      const response = await fetch('/api/chat/messages/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentEmail,
          sender
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Only invalidate if there were actually messages marked as read
      if (data.modifiedCount > 0) {
        queryClient.invalidateQueries(['chatMessages', variables.studentEmail]);
        queryClient.invalidateQueries(['chatConversations']);
      }
    },
    onError: (error) => {
      console.error('Failed to mark messages as read:', error);
      // Don't show toast for read marking errors as they're not critical
    }
  });
};