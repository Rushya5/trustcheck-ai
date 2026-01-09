import { 
  Shield, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CaseCard } from '@/components/dashboard/CaseCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CredibilityMeter } from '@/components/dashboard/CredibilityMeter';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { useStats } from '@/hooks/useStats';

export default function Dashboard() {
  const { cases, isLoading: casesLoading } = useCases();
  const { data: stats, isLoading: statsLoading } = useStats();

  const recentCases = cases.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Real-time forensic analysis overview"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="forensic-card p-5 animate-pulse">
                <div className="h-20 bg-muted rounded" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Cases"
                value={stats?.totalCases ?? 0}
                subtitle="Active investigations"
                icon={FileSearch}
                variant="primary"
              />
              <StatsCard
                title="Deepfakes Detected"
                value={stats?.deepfakesDetected ?? 0}
                subtitle="Manipulated media"
                icon={AlertTriangle}
                variant="danger"
              />
              <StatsCard
                title="Verified Authentic"
                value={stats?.verifiedAuthentic ?? 0}
                subtitle="Media cleared"
                icon={CheckCircle}
                variant="trust"
              />
              <StatsCard
                title="Pending Analysis"
                value={stats?.pendingAnalyses ?? 0}
                subtitle="In queue"
                icon={Clock}
                variant="warning"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Cases</h2>
              <Link to="/cases">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {casesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentCases.length > 0 ? (
              <div className="space-y-3">
                {recentCases.map((caseData, index) => (
                  <div 
                    key={caseData.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CaseCard caseData={caseData} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="forensic-card p-12 text-center">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No cases yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first investigation by uploading media for analysis.
                </p>
                <Link to="/upload">
                  <Button variant="forensic">Create First Case</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Threat Level */}
            <div className="forensic-card p-6">
              <h3 className="font-semibold text-foreground mb-4 text-center">
                Platform Trust Level
              </h3>
              <div className="flex justify-center">
                <CredibilityMeter score={stats?.avgCredibility ?? 50} size="lg" />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Based on {stats?.completedAnalyses ?? 0} analyses
              </p>
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="forensic-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/upload">
              <Button variant="forensic" className="w-full h-auto py-4 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>New Analysis</span>
              </Button>
            </Link>
            <Link to="/cases">
              <Button variant="glass" className="w-full h-auto py-4 flex-col gap-2">
                <FileSearch className="h-6 w-6" />
                <span>Browse Cases</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="glass" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </Link>
            <Link to="/blockchain">
              <Button variant="glass" className="w-full h-auto py-4 flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Verify Hash</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
