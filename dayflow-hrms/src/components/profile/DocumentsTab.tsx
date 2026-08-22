import React, { useState } from 'react';
import { User, DocumentItem } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Download, Upload, ShieldCheck, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DocumentsTab: React.FC<{ employee: User; onUploadDocument?: (doc: DocumentItem) => void }> = ({ employee }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(employee.documents || []);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: 'doc-' + Date.now(),
        title: 'Updated State Certificate 2026',
        category: 'certificate',
        fileName: 'Certificate_Verified_2026.pdf',
        fileSize: '1.4 MB',
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }, 800);
  };

  const handleDownload = (doc: DocumentItem) => {
    alert(`Simulated download started for "${doc.fileName}"`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Employee Document Vault</span>
          </CardTitle>
          <p className="text-xs text-slate-500">Verified employment agreements, identity documents, and tax forms</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSimulatedUpload}
          isLoading={isUploading}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          Upload Document
        </Button>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.fileName} &bull; {doc.fileSize} &bull; Uploaded {formatDate(doc.uploadDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
