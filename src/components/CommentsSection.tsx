
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface CommentsSectionProps {
  reportId: string;
}

export const CommentsSection = ({ reportId }: CommentsSectionProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Then get profiles for the comment user IDs
      const userIds = commentsData?.map(comment => comment.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.id === comment.user_id) || null
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          report_id: reportId,
          user_id: user.id,
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast({ title: "Comment posted successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h4 className="font-medium text-gray-900">Comments</h4>

      {loading ? (
        <div className="text-center text-gray-500">Loading comments...</div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {comment.profiles?.full_name || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {comments.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Share your thoughts, ${profile?.full_name || user.email}...`}
            rows={2}
            className="resize-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || submitting}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm text-center py-2">
          Please login to post comments
        </p>
      )}
    </div>
  );
};
