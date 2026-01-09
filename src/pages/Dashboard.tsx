import { 
  Shield, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CaseCard } from '@/components/dashboard/CaseCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CredibilityMeter } from '@/components/dashboard/CredibilityMeter';
import { mockCases } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Real-time forensic analysis overview"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Cases"
            value={24}
            subtitle="Active investigations"
            icon={FileSearch}
            trend={{ value: 12, positive: true }}
            variant="primary"
          />
          <StatsCard
            title="Deepfakes Detected"
            value={156}
            subtitle="This month"
            icon={AlertTriangle}
            trend={{ value: 8, positive: false }}
            variant="danger"
          />
          <StatsCard
            title="Verified Authentic"
            value={342}
            subtitle="Media cleared"
            icon={CheckCircle}
            trend={{ value: 15, positive: true }}
            variant="trust"
          />
          <StatsCard
            title="Pending Analysis"
            value={18}
            subtitle="In queue"
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Cases</h2>
              <Link to="/cases">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {mockCases.map((caseData, index) => (
                <div 
                  key={caseData.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CaseCard caseData={caseData} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Threat Level */}
            <div className="forensic-card p-6">
              <h3 className="font-semibold text-foreground mb-4 text-center">
                Global Threat Level
              </h3>
              <div className="flex justify-center">
                <CredibilityMeter score={62} size="lg" />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Based on 498 analyses today
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
            <Link to="/settings">
              <Button variant="glass" className="w-full h-auto py-4 flex-col gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span>Threat Feed</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
