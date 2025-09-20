
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/stores/auth-store";
import { useExams } from "@/lib/stores/exams-store";
import { PlusIcon, RefreshCwIcon, Search, FilterIcon } from "lucide-react";
import { ExamCard } from "@/components/ui/ExamCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";


const Exams = () => {
  const { exams, loading, fetchExams } = useExams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredExams, setFilteredExams] = useState(exams);

  console.log('Exams component loaded, exams count:', exams.length);

  // Fetch exams from database on component mount
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Update filtered exams whenever exams, categoryFilter, or searchTerm changes
  useEffect(() => {
    console.log('Filtering exams, total:', exams.length);
    let filtered = exams;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(exam => exam.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log('Filtered exams:', filtered.length);
    setFilteredExams(filtered);
  }, [exams, categoryFilter, searchTerm]);

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleRefresh = async () => {
    console.log('Refresh clicked - showing current data');
    toast.success("Showing current exam data");
  };  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container my-5 mx-auto px-4 py-8 md:py-12">
        <div className="space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Upcoming Exams</h1>
                <p className="text-muted-foreground">
                  Browse and track important exam dates
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {currentUser?.role === 'admin' && (
                  <Button onClick={() => navigate('/admin')} className="flex items-center gap-1">
                    <PlusIcon className="h-4 w-4" />
                    Add New Exams
                  </Button>
                )}
                <Button 
                  onClick={handleRefresh} 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  disabled={loading}
                >
                  <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select onValueChange={handleCategoryChange} defaultValue={categoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Law">Law</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Civil Services">Civil Services</SelectItem>
                  <SelectItem value="Banking">Banking</SelectItem>
                  <SelectItem value="Teaching">Teaching</SelectItem>
                  <SelectItem value="School Board">School Board</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[350px] w-full rounded-lg" />
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No exams found. Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Exams;
