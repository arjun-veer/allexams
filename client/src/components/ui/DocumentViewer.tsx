import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ZoomIn, ZoomOut, RotateCw, ExternalLink, FileText } from 'lucide-react';
import { UserDocument } from '@/lib/types';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface DocumentViewerProps {
  document: UserDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onProcessDocument?: (document: UserDocument) => void;
}

export const DocumentViewer = ({ document, isOpen, onClose, onProcessDocument }: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [viewUrl, setViewUrl] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    if (document) {
      // Get authenticated URLs for viewing and downloading
      const getUrls = async () => {
        try {
          const viewUrlResult = await apiClient.viewDocument(document.id);
          const downloadUrlResult = await apiClient.downloadDocument(document.id);
          setViewUrl(viewUrlResult);
          setDownloadUrl(downloadUrlResult);
        } catch (error) {
          console.error('Error getting document URLs:', error);
          // Fallback to direct URL if API fails
          setViewUrl(document.url || '');
          setDownloadUrl(document.url || '');
        }
      };
      getUrls();
    }
  }, [document]);

  if (!document) return null;

  const handleDownload = () => {
    if (downloadUrl) {
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.documentName || document.fileName;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success("Download started");
    } else {
      toast.error("Download URL not available");
    }
  };

  const handleOpenInNewTab = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    } else {
      toast.error("View URL not available");
    }
  };

  const handleProcessDocument = () => {
    if (onProcessDocument) {
      onProcessDocument(document);
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const renderDocumentContent = () => {
    const fileType = document.fileType.toLowerCase();
    
    if (fileType === 'pdf') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          {viewUrl ? (
            <iframe
              src={viewUrl}
              className="w-full h-full border-0"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              title={document.documentName || document.fileName}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'].includes(fileType)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-auto">
          {(viewUrl || document.url) ? (
            <img
              src={viewUrl || document.url}
              alt={document.documentName || document.fileName}
              className="max-w-full max-h-full object-contain"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                toast.error('Failed to load image');
              }}
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
        </div>
      );
    } else if (['doc', 'docx'].includes(fileType)) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-center p-8">
          <div className="mb-4">
            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h3V8h-3V5H9v3H6v2h3v3z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Word Document</h3>
          <p className="text-muted-foreground mb-4">
            Word documents cannot be previewed directly in the browser.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-center p-8">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6l-4-4H4v16zM9 13h2v-3h3V8h-3V5H9v3H6v2h3v3z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Unsupported Format</h3>
          <p className="text-muted-foreground mb-4">
            This file type cannot be previewed directly in the browser.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold truncate">
            {document.documentName || document.fileName}
          </DialogTitle>
          <DialogDescription>
            {document.category && `Category: ${document.category} • `}
            {document.fileType.toUpperCase()} • {document.fileSize} KB
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            {(['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(document.fileType.toLowerCase())) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">{zoom}%</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {document.fileType.toLowerCase() === 'pdf' && onProcessDocument && (
              <Button onClick={handleProcessDocument} variant="default" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Process Document
              </Button>
            )}
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-hidden">
          {renderDocumentContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};