
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/lib/stores/documents-store';
import { useAuth } from '@/lib/stores/auth-store';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploadModal } from '@/components/ui/DocumentUploadModal';
import { Upload, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const DocumentWallet = () => {
  const { documents, uploadDocument, fetchDocuments, isLoading } = useDocuments();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Get all available categories and file types
  const availableCategories = useMemo(() => {
    const categories = [...new Set(documents.map(doc => doc.category).filter(Boolean))];
    return categories.sort();
  }, [documents]);

  const availableFileTypes = useMemo(() => {
    const types = [...new Set(documents.map(doc => doc.fileType.toLowerCase()))];
    return types.sort();
  }, [documents]);

  // Filter documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      const matchesSearch = !searchQuery || 
        (document.documentName && document.documentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        document.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || document.category === selectedCategory;
      
      const matchesFileType = selectedFileType === 'all' || 
        document.fileType.toLowerCase() === selectedFileType.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesFileType;
    });
  }, [documents, searchQuery, selectedCategory, selectedFileType]);
  
  // Get documents organized by category
  const getDocumentsByCategory = () => {
    const documentsByCategory: Record<string, any[]> = {};
    
    // Initialize with default categories
    documentsByCategory['All Documents'] = filteredDocuments;
    documentsByCategory['Certificates'] = [];
    documentsByCategory['Identity Documents'] = [];
    documentsByCategory['Academic Records'] = [];
    documentsByCategory['Exam Documents'] = [];
    documentsByCategory['Other Documents'] = [];
    
    // Group filtered documents by category
    filteredDocuments.forEach(document => {
      const category = document.category || 'Other Documents';
      if (!documentsByCategory[category]) {
        documentsByCategory[category] = [];
      }
      documentsByCategory[category].push(document);
    });
    
    // Filter out empty categories (except for 'All Documents' and default ones)
    return Object.fromEntries(
      Object.entries(documentsByCategory)
        .filter(([category, docs]) => 
          docs.length > 0 || ['All Documents', 'Certificates', 'Identity Documents', 'Academic Records', 'Exam Documents', 'Other Documents'].includes(category)
        )
    );
  };
  
  const documentsByCategory = getDocumentsByCategory();
  const categories = Object.keys(documentsByCategory);
  
  // Scroll functions for tabs
  const checkScrollButtons = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const containerWidth = tabsListRef.current.clientWidth;
      const scrollAmount = Math.min(containerWidth * 0.8, 300); // Scroll 80% of container width or max 300px
      const newScrollLeft = direction === 'left' 
        ? tabsListRef.current.scrollLeft - scrollAmount
        : tabsListRef.current.scrollLeft + scrollAmount;
      
      tabsListRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll state on mount and when categories change
  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  // Add scroll event listener to tabs list
  useEffect(() => {
    const tabsList = tabsListRef.current;
    if (tabsList) {
      tabsList.addEventListener('scroll', checkScrollButtons);
      return () => tabsList.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);
  
  const handleUpload = async (file: File, documentName: string, category: string) => {
    try {
      setIsUploading(true);
      await uploadDocument(file, documentName, category);
      // Refetch documents to ensure we have the latest data
      fetchDocuments();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      throw error; // Let the modal handle the error display
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Wallet</h2>
          <p className="text-muted-foreground mt-1">
            Store and manage your important documents securely
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={!isAuthenticated}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isAuthenticated ? 'Upload Document' : 'Login to Upload'}
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      {isAuthenticated && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableFileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Results summary */}
      {isAuthenticated && (searchQuery || selectedCategory !== 'all' || selectedFileType !== 'all') && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {selectedFileType !== 'all' && ` (${selectedFileType.toUpperCase()} files)`}
        </div>
      )}
      
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Please Log In</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to be logged in to view and manage your documents. Please log in to access your document wallet.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue={categories[0] || 'All Documents'} className="w-full">
          <div className="relative mb-6">
            {/* Left gradient overlay */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200`}
            />
            
            {/* Right gradient overlay */}
            <div 
              className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200`}
            />

            <div className="flex items-center">
              {/* Left scroll button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('left')}
                disabled={!canScrollLeft}
                className={`absolute left-0 z-20 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-md hover:bg-background ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-all duration-200`}
                style={{ marginLeft: '4px' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Scrollable tabs list */}
              <div className="flex-1 overflow-hidden mx-8">
                <TabsList 
                  ref={tabsListRef}
                  className="w-full justify-start overflow-x-auto scrollbar-hide relative flex gap-1 bg-muted p-1 rounded-md"
                  style={{ 
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm font-medium transition-all"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Right scroll button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('right')}
                disabled={!canScrollRight}
                className={`absolute right-0 z-20 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-md hover:bg-background ${
                  canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } transition-all duration-200`}
                style={{ marginRight: '4px' }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              {documentsByCategory[category].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {documentsByCategory[category].map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
                  <div className="rounded-full bg-secondary p-3 mb-4">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    {(searchQuery || selectedCategory !== 'all' || selectedFileType !== 'all') 
                      ? 'No matching documents' 
                      : 'No documents'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                    {(searchQuery || selectedCategory !== 'all' || selectedFileType !== 'all')
                      ? 'Try adjusting your search or filters to find what you\'re looking for.'
                      : `You haven't uploaded any ${category.toLowerCase() === 'all documents' ? '' : category.toLowerCase()} documents yet.`}
                  </p>
                  {!(searchQuery || selectedCategory !== 'all' || selectedFileType !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!isAuthenticated}
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      {isAuthenticated ? 'Upload your first document' : 'Login to upload'}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {isAuthenticated && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};
