import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MessageSquare, Send, ArrowLeft, User, Building2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface Participant {
  _id: string;
  name: string;
  avatar: string | null;
  type: 'employer' | 'jobseeker';
}

interface Conversation {
  _id: string;
  participant: Participant;
  lastMessage: {
    text: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  isFromMe: boolean;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations');
      return response.data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const conversations: Conversation[] = conversationsData?.conversations || [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return null;
      const response = await api.get(`/messages/${selectedConversationId}`);
      return response.data.data;
    },
    enabled: !!selectedConversationId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const messages: Message[] = messagesData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: string; text: string }) => {
      const response = await api.post('/messages', data);
      return response.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select first conversation on load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      text: messageText.trim(),
    });
  };

  const selectedConversation = conversations.find((c) => c._id === selectedConversationId);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingConversations) {
    return <LoadingSpinner fullScreen text="Loading messages..." />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background">
      {/* Left Pane - Conversation List */}
      <div
        className={cn(
          'w-full md:w-96 border-r border-border flex flex-col bg-card',
          selectedConversationId && 'hidden md:flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground">
                Your messages will appear here once you start a conversation
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedConversationId(conversation._id)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-colors hover:bg-accent',
                    selectedConversationId === conversation._id && 'bg-accent border border-primary'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {conversation.participant.avatar ? (
                        <img
                          src={conversation.participant.avatar}
                          alt={conversation.participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : conversation.participant.type === 'employer' ? (
                        <Building2 className="w-6 h-6 text-brand-500" />
                      ) : (
                        <User className="w-6 h-6 text-brand-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {conversation.participant.name}
                        </h4>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.isFromMe && 'You: '}
                          {conversation.lastMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Area */}
      <div className={cn('flex-1 flex flex-col', !selectedConversationId && 'hidden md:flex')}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center gap-3">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="md:hidden p-2 hover:bg-accent rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedConversation.participant.avatar ? (
                  <img
                    src={selectedConversation.participant.avatar}
                    alt={selectedConversation.participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : selectedConversation.participant.type === 'employer' ? (
                  <Building2 className="w-5 h-5 text-brand-500" />
                ) : (
                  <User className="w-5 h-5 text-brand-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{selectedConversation.participant.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedConversation.participant.type}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation by sending a message below
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={cn('flex gap-3', message.isFromMe && 'flex-row-reverse')}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {message.sender.avatar ? (
                          <img
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : message.isFromMe ? (
                          <User className="w-4 h-4 text-brand-500" />
                        ) : (
                          <User className="w-4 h-4 text-brand-500" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          message.isFromMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-card border border-border rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm break-words">{message.text}</p>
                        <p
                          className={cn(
                            'text-xs mt-1',
                            message.isFromMe ? 'text-white/70' : 'text-muted-foreground'
                          )}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={sendMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}