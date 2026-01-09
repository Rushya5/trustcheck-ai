import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CaseCard } from '@/components/dashboard/CaseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCases } from '@/hooks/useCases';
import { Plus, Search, Filter, Loader2, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CasesPage() {
  const { cases, isLoading } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      <Header 
        title="Cases" 
        subtitle="Manage forensic investigation cases"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/upload">
            <Button variant="forensic">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Cases Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.length > 0 ? (
              filteredCases.map((caseData, index) => (
                <div 
                  key={caseData.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CaseCard caseData={caseData} />
                </div>
              ))
            ) : (
              <div className="forensic-card p-12 text-center">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No cases found matching your criteria'
                    : 'No cases yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Create your first case to start analyzing media'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Link to="/upload">
                    <Button variant="forensic">Create First Case</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
