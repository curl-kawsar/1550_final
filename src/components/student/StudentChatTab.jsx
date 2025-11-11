"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Shield, RefreshCw } from 'lucide-react';
import { useChatMessages, useSendMessage, useMarkAsRead } from '@/hooks/useChat';

export default function StudentChatTab({ student }) {
  const [message, setMessage] = useState('');
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  
  const studentEmail = student?.email;
  
  const { 
    data: chatData, 
    isLoading,
    error,
    refetch,
    isRefetching
  } = useChatMessages(studentEmail, {
    enabled: !!studentEmail
  });
  
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  const messages = chatData?.messages || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark admin messages as read when tab is active
  useEffect(() => {
    if (studentEmail && messages.length > 0) {
      const unreadAdminMessages = messages.filter(
        msg => msg.sender === 'admin' && msg.status !== 'read'
      );
      
      if (unreadAdminMessages.length > 0 && !markAsReadMutation.isPending) {
        // Check if we have new unread messages that we haven't already processed
        const latestUnreadMessageId = unreadAdminMessages[unreadAdminMessages.length - 1]?._id;
        
        if (latestUnreadMessageId && latestUnreadMessageId !== lastReadMessageId) {
          setLastReadMessageId(latestUnreadMessageId);
          markAsReadMutation.mutate({
            studentEmail,
            sender: 'admin'
          });
        }
      }
    }
  }, [studentEmail, messages, lastReadMessageId]); // Track lastReadMessageId to prevent duplicate marking

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !studentEmail) return;

    try {
      await sendMessageMutation.mutateAsync({
        message: message.trim(),
        sender: 'student',
        studentEmail
      });
      
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  if (!studentEmail) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Unable to load chat. Please try refreshing the page.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] sm:max-h-[600px] bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Admin Support</h3>
            <p className="text-xs text-gray-500">Usually replies within minutes</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || isLoading || isRefetching}
          className="p-2"
        >
          <RefreshCw className={`h-4 w-4 ${(refreshing || isLoading || isRefetching) ? 'animate-spin' : ''} text-gray-600`} />
        </Button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p>Failed to load messages</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  className="mt-2"
                  disabled={refreshing || isRefetching}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRefetching) ? 'animate-spin' : ''}`} />
                  {(refreshing || isRefetching) ? 'Retrying...' : 'Try Again'}
                </Button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="text-center text-gray-500 max-w-xs px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-700">Start a Conversation</h3>
                <p className="text-gray-600 text-sm">Send a message to our admin support team. We're here to help!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => {
                const showTimestamp = index === 0 || 
                  messages[index - 1]?.sender !== msg.sender ||
                  (new Date(msg.createdAt) - new Date(messages[index - 1]?.createdAt)) > 300000; // 5 minutes
                
                return (
                  <div key={msg._id || index}>
                    {/* Timestamp (shown occasionally) */}
                    {showTimestamp && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                          {msg.sender === 'admin' ? msg.adminName || 'Admin Support' : 'You'} • {msg.formattedTime}
                        </span>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} px-1`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}>
                        <div
                          className={`inline-block px-4 py-2 text-sm sm:text-base rounded-2xl break-words ${
                            msg.sender === 'student'
                              ? 'bg-blue-600 text-white rounded-br-md ml-auto'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-3 sm:p-4 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full min-h-[44px] px-4 py-3 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-blue-500 resize-none text-sm sm:text-base"
              disabled={sendMessageMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0 flex items-center justify-center flex-shrink-0"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 px-1">
          Press Enter to send • Usually replies within minutes
        </p>
      </div>
    </div>
  );
}