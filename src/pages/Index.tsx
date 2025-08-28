
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CreateReportModal } from '@/components/CreateReportModal';
import { ReportCard } from '@/components/ReportCard';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { AlertCircle, MapPin } from 'lucide-react';

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

const Index = () => {
  const { loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // First get reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Then get profiles for the report user IDs
      const userIds = reportsData?.map(report => report.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const reportsWithProfiles = reportsData?.map(report => ({
        ...report,
        profiles: profilesData?.find(profile => profile.id === report.user_id) || null
      })) || [];

      setReports(reportsWithProfiles);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = selectedCategory === 'All' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onCreateReport={() => setShowCreateModal(true)}
        onAuthClick={() => setShowAuthModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Report Civic Issues in Your Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help make your neighborhood better by reporting problems like potholes, 
            fallen trees, broken streetlights, and more. Vote on reports to help verify 
            their accuracy and keep your community informed.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Making communities safer, one report at a time</span>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{reports.length}</div>
            <div className="text-gray-600">Total Reports</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {reports.filter(r => !r.is_disputed).length}
            </div>
            <div className="text-gray-600">Verified Reports</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-red-600">
              {reports.filter(r => r.is_disputed).length}
            </div>
            <div className="text-gray-600">Disputed Reports</div>
          </div>
        </motion.div>

        {/* Reports Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'All' ? 'Latest Reports' : `${selectedCategory} Reports`}
          </h2>
          <p className="text-gray-600">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onVoteUpdate={fetchReports}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'All' 
                ? "Be the first to report a civic issue in your community!"
                : `No reports found in the ${selectedCategory} category.`
              }
            </p>
          </motion.div>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onReportCreated={fetchReports}
      />
    </div>
  );
};

export default Index;
