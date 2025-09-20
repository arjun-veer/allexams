
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDocument } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File, FileText, Image, Trash2, Eye } from "lucide-react";
import { useDocuments } from "@/lib/stores/documents-store";
import { DocumentViewer } from "./DocumentViewer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: UserDocument;
}

export const DocumentCard = ({ document: userDocument }: DocumentCardProps) => {
  const { deleteDocument } = useDocuments();
  const navigate = useNavigate();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const handleDelete = async () => {
    try {
      await deleteDocument(userDocument.id);
      toast.success("Document deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };
  
  const handleView = () => {
    setIsViewerOpen(true);
  };

  const handleProcessDocument = (document: UserDocument) => {
    // Navigate to document processor with the document data
    navigate('/document-processor', { 
      state: { 
        document: document 
      } 
    });
    toast.success("Opening Document Processor...");
  };
  
  const handleDownload = () => {
    if (userDocument.url) {
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = userDocument.url;
      link.download = userDocument.documentName || userDocument.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } else {
      toast.error("Document URL not available");
    }
  };
  
  // Determine icon based on file type
  const getFileIcon = () => {
    const fileType = userDocument.fileType.toLowerCase();
    
    if (fileType === 'pdf') {
      return <File className="h-12 w-12 text-red-500" />;
    } else if (fileType === 'docx' || fileType === 'doc') {
      return <FileText className="h-12 w-12 text-blue-500" />;
    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(fileType)) {
      return <Image className="h-12 w-12 text-green-500" />;
    } else {
      return <File className="h-12 w-12 text-gray-500" />;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full">
      <CardHeader className="p-6 bg-muted/30 flex items-center justify-center">
        <div className="rounded-full bg-background p-3 shadow-sm">
          {getFileIcon()}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <CardTitle className="text-base font-medium truncate mb-1" title={userDocument.documentName || userDocument.fileName}>
          {userDocument.documentName || userDocument.fileName}
        </CardTitle>
        {userDocument.documentName && userDocument.documentName !== userDocument.fileName && (
          <p className="text-sm text-muted-foreground truncate mb-2" title={userDocument.fileName}>
            File: {userDocument.fileName}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className={cn("uppercase font-medium px-2 py-1 rounded-full text-xs", {
              "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300": userDocument.fileType === 'pdf',
              "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300": userDocument.fileType === 'docx' || userDocument.fileType === 'doc',
              "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300": ['jpg', 'jpeg', 'png', 'webp'].includes(userDocument.fileType.toLowerCase()),
              "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300": !['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'webp'].includes(userDocument.fileType.toLowerCase()),
            })}>
              {userDocument.fileType}
            </span>
            <span>{userDocument.fileSize} KB</span>
          </div>
          {userDocument.category && (
            <div className="text-xs text-muted-foreground">
              Category: {userDocument.category}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between border-t mt-4">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleView} 
            className="flex items-center gap-1 hover:bg-muted/50"
          >
            <Eye className="h-4 w-4" />
            <span className="sm:inline hidden">View</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload} 
            className="flex items-center gap-1 hover:bg-muted/50"
          >
            <Download className="h-4 w-4" />
            <span className="sm:inline hidden">Download</span>
          </Button>
          {userDocument.fileType.toLowerCase() === 'pdf' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleProcessDocument(userDocument)} 
              className="flex items-center gap-1 hover:bg-muted/50"
            >
              <FileText className="h-4 w-4" />
              <span className="sm:inline hidden">Process</span>
            </Button>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete} 
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sm:inline hidden">Delete</span>
        </Button>
      </CardFooter>
      
      <DocumentViewer
        document={userDocument}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onProcessDocument={handleProcessDocument}
      />
    </Card>
  );
};
