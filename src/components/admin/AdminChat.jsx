"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import { useChatConversations, useChatMessages, useSendMessage, useMarkAsRead } from '@/hooks/useChat';

export default function AdminChat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [adminName] = useState('Admin Support'); // You can make this dynamic
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading,
    refetch: refetchConversations,
    isRefetching: isRefetchingConversations
  } = useChatConversations();
  
  const { 
    data: chatData, 
    isLoading: messagesLoading,
    refetch: refetchMessages,
    isRefetching: isRefetchingMessages
  } = useChatMessages(selectedConversation?.studentEmail, {
    enabled: !!selectedConversation?.studentEmail
  });
  
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  const conversations = conversationsData?.conversations || [];
  const messages = chatData?.messages || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedConversation) {
        await refetchMessages();
      } else {
        await refetchConversations();
      }
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // Reset last read message ID when conversation changes
  useEffect(() => {
    setLastReadMessageId(null);
  }, [selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation]);

  // Mark student messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadStudentMessages = messages.filter(
        msg => msg.sender === 'student' && msg.status !== 'read'
      );
      
      if (unreadStudentMessages.length > 0 && !markAsReadMutation.isPending) {
        // Check if we have new unread messages that we haven't already processed
        const latestUnreadMessageId = unreadStudentMessages[unreadStudentMessages.length - 1]?._id;
        
        if (latestUnreadMessageId && latestUnreadMessageId !== lastReadMessageId) {
          setLastReadMessageId(latestUnreadMessageId);
          markAsReadMutation.mutate({
            studentEmail: selectedConversation.studentEmail,
            sender: 'student'
          });
        }
      }
    }
  }, [selectedConversation, messages, lastReadMessageId]); // Removed markAsReadMutation from deps to prevent infinite loop

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        message: message.trim(),
        sender: 'admin',
        studentEmail: selectedConversation.studentEmail,
        adminName
      });
      
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatLastMessageTime = (time) => {
    const now = new Date();
    const messageTime = new Date(time);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] sm:max-h-[600px] bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              {selectedConversation ? selectedConversation.studentName : 'Student Messages'}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedConversation 
                ? selectedConversation.studentEmail 
                : totalUnreadMessages > 0 
                  ? `${totalUnreadMessages} unread message${totalUnreadMessages > 1 ? 's' : ''}` 
                  : 'No new messages'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isRefetchingConversations || isRefetchingMessages}
            className="p-2"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${(refreshing || isRefetchingConversations || isRefetchingMessages) ? 'animate-spin' : ''}`} />
          </Button>
          {selectedConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {!selectedConversation ? (
          // Conversations List
          <div className="h-full overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading conversations...</p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full py-8">
                <div className="text-center text-gray-500 max-w-xs px-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-700">No Conversations</h3>
                  <p className="text-gray-600 text-sm">Student messages will appear here when they contact support.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.studentEmail}
                    onClick={() => setSelectedConversation(conversation)}
                    className="flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {conversation.studentName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.studentEmail}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatLastMessageTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-1">
                          {conversation.lastSender === 'admin' ? 'You:' : ''}
                        </span>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Selected Conversation
          <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 min-h-0">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full py-8">
                  <div className="text-center text-gray-500 max-w-xs px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-700">No Messages Yet</h3>
                    <p className="text-gray-600 text-sm">Start the conversation with {selectedConversation.studentName}</p>
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
                              {msg.sender === 'admin' ? msg.adminName || 'Admin' : selectedConversation.studentName} • {msg.formattedTime}
                            </span>
                          </div>
                        )}
                        
                        {/* Message */}
                        <div className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'} px-1`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}>
                            <div
                              className={`inline-block px-4 py-2 text-sm sm:text-base rounded-2xl break-words ${
                                msg.sender === 'admin'
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
            <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Reply to ${selectedConversation.studentName}...`}
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
                Press Enter to send • Replying as Admin Support
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}