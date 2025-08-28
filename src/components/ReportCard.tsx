
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { CommentsSection } from './CommentsSection';

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  image_url: string | null;
  true_votes: number;
  false_votes: number;
  is_disputed: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
}

interface Vote {
  user_id: string;
  is_true_vote: boolean;
}

interface ReportCardProps {
  report: Report;
  onVoteUpdate: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Traffic': 'bg-red-100 text-red-800',
    'Road Damage': 'bg-orange-100 text-orange-800',
    'Water Drainage': 'bg-blue-100 text-blue-800',
    'Tree Fallen': 'bg-green-100 text-green-800',
    'Street Light Issue': 'bg-yellow-100 text-yellow-800',
    'Garbage': 'bg-brown-100 text-brown-800',
    'Construction': 'bg-gray-100 text-gray-800',
    'Public Property Damage': 'bg-purple-100 text-purple-800',
    'Others': 'bg-indigo-100 text-indigo-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export const ReportCard = ({ report, onVoteUpdate }: ReportCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, report.id]);

  const fetchUserVote = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('report_id', report.id)
      .single();

    setUserVote(data);
  };

  const handleVote = async (isTrue: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to vote on reports",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (userVote) {
        if (userVote.is_true_vote === isTrue) {
          // Remove vote if clicking the same vote
          await supabase
            .from('votes')
            .delete()
            .eq('user_id', user.id)
            .eq('report_id', report.id);
          setUserVote(null);
        } else {
          // Update vote if clicking different vote
          await supabase
            .from('votes')
            .update({ is_true_vote: isTrue })
            .eq('user_id', user.id)
            .eq('report_id', report.id);
          setUserVote({ ...userVote, is_true_vote: isTrue });
        }
      } else {
        // Create new vote
        const { data } = await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            report_id: report.id,
            is_true_vote: isTrue,
          })
          .select()
          .single();
        setUserVote(data);
      }

      onVoteUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryColor(report.category)}>
                  {report.category}
                </Badge>
                {report.is_disputed && (
                  <Badge variant="destructive">Disputed Report</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold">{report.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {report.profiles?.full_name || 'Anonymous'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(report.created_at)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {report.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={report.image_url}
                alt="Report"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <p className="text-gray-700">{report.description}</p>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {report.location}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(true)}
                  disabled={loading}
                  className={`flex items-center gap-2 ${
                    userVote?.is_true_vote === true ? 'text-green-600 bg-green-50' : ''
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {report.true_votes}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(false)}
                  disabled={loading}
                  className={`flex items-center gap-2 ${
                    userVote?.is_true_vote === false ? 'text-red-600 bg-red-50' : ''
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {report.false_votes}
                </Button>
              </motion.div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Comments
            </Button>
          </div>

          {showComments && (
            <CommentsSection reportId={report.id} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
