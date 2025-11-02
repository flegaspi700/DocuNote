'use client';

import { useRef, useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import { Link, Plus, Loader2 } from 'lucide-react';
import { FileInfo, AITheme } from '@/lib/types';
import { 
  validateFile, 
  validateFileContent,
  formatFileSize, 
  formatContentLength,
} from '@/lib/validation';
import { scrapeUrl } from '@/app/actions';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { SourceCard } from '@/components/source-card';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileUploadProps {
  files: FileInfo[];
  setFiles: Dispatch<SetStateAction<FileInfo[]>>;
  aiTheme: AITheme | null;
}

export function FileUpload({ files, setFiles, aiTheme }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const { toast } = useToast();
  const { isMobile, setOpenMobile } = useSidebar();
  
  const urlSources = files.filter(f => f.type === 'url');
  const fileSources = files.filter(f => f.type === 'file');

  const backgroundImage = useMemo(() => {
    // If AI theme has a generated background, use it
    if (aiTheme?.backgroundImageUrl) {
      return `linear-gradient(to bottom, hsl(var(--background) / 0.8), hsl(var(--background) / 0.8)), url(${aiTheme.backgroundImageUrl})`;
    }
    // Otherwise, no background image
    return 'none';
  }, [aiTheme]);

  const handleAddUrl = async () => {
    if (!url.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid website URL.',
      });
      return;
    }
    
    if (files.some(f => f.source === url)) {
      toast({
        variant: 'destructive',
        title: 'URL already exists',
        description: `The URL "${url}" is already in the list.`
      });
      return;
    }

    setIsScraping(true);
    const result = await scrapeUrl(url);
    setIsScraping(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Scraping Error',
        description: result.error,
      });
    } else if (result.content) {
      // Ensure content is defined before adding to files
      const scrapedContent = result.content || '';
      setFiles(prev => [
        ...prev,
        {
          name: result.title || url,
          content: scrapedContent,
          type: 'url',
          source: url,
        },
      ]);
      toast({
        title: 'URL Scraped',
        description: `Content from "${url}" has been added.`,
      });
      setUrl('');
      
      // Auto-close sidebar on mobile after adding URL
      if (isMobile) {
        setOpenMobile(false);
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    for (const selectedFile of Array.from(selectedFiles)) {
      // Validate file before processing
      const validation = validateFile(selectedFile);
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: validation.error || 'Invalid file',
          description: validation.details || 'Please check the file and try again.',
        });
        continue;
      }

      // Check for duplicates
      if (files.some(f => f.name === selectedFile.name && f.type === 'file')) {
        toast({
          variant: 'destructive',
          title: 'File already exists',
          description: `"${selectedFile.name}" is already in the list.`,
        });
        continue;
      }

      const readFile = (file: File, type: 'text' | 'arrayBuffer') => {
        return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result || null);
          reader.onerror = reject;
          if (type === 'text') {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        });
      };
      
      try {
        let content = '';
        const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
        
        // Handle different file types
        if (selectedFile.type === 'text/plain' || fileExtension === '.txt') {
          // Plain text files
          content = await readFile(selectedFile, 'text') as string;
        } 
        else if (fileExtension === '.md' || selectedFile.type === 'text/markdown' || selectedFile.type === 'text/x-markdown') {
          // Markdown files - just read as plain text (formatting preserved in display)
          content = await readFile(selectedFile, 'text') as string;
        }
        else if (fileExtension === '.csv' || selectedFile.type === 'text/csv' || selectedFile.type === 'application/vnd.ms-excel') {
          // CSV files - parse and format as readable text
          const csvText = await readFile(selectedFile, 'text') as string;
          const parseResult = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
          });
          
          if (parseResult.errors.length > 0) {
            throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
          }
          
          // Format CSV data as readable text
          const data = parseResult.data as Record<string, any>[];
          const headers = parseResult.meta.fields || [];
          
          content = `CSV Data from ${selectedFile.name}\n\n`;
          content += `Total rows: ${data.length}\n`;
          content += `Columns: ${headers.join(', ')}\n\n`;
          content += `Data:\n${'-'.repeat(50)}\n`;
          
          data.forEach((row, index) => {
            content += `\nRow ${index + 1}:\n`;
            headers.forEach(header => {
              content += `  ${header}: ${row[header]}\n`;
            });
          });
        }
        else if (selectedFile.type === 'application/pdf') {
          // PDF files
          const arrayBuffer = await readFile(selectedFile, 'arrayBuffer') as ArrayBuffer;
          if (!arrayBuffer) throw new Error("Could not read PDF file.");

          const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map(item => ('str' in item ? item.str : ''))
              .join(' ');
            fullText += pageText + '\n';
          }
          content = fullText;
        }
        else if (fileExtension === '.docx' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // DOCX files - extract text using mammoth
          const arrayBuffer = await readFile(selectedFile, 'arrayBuffer') as ArrayBuffer;
          if (!arrayBuffer) throw new Error("Could not read DOCX file.");
          
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
          
          if (result.messages.length > 0) {
            console.warn('DOCX conversion warnings:', result.messages);
          }
        }
        else {
          toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a .txt, .pdf, .md, .csv, or .docx file.',
          });
          continue;
        }

        // Validate content length
        const contentValidation = validateFileContent(content, selectedFile.name);
        if (!contentValidation.isValid) {
          toast({
            variant: 'destructive',
            title: contentValidation.error || 'Invalid content',
            description: contentValidation.details || 'File content is too large.',
          });
          continue;
        }

        // Add file to list
        setFiles(prev => [
          ...prev,
          { name: selectedFile.name, content, type: 'file', source: selectedFile.name },
        ]);
        
        // Show success with size info
        const sizeInfo = formatFileSize(selectedFile.size);
        const contentInfo = formatContentLength(content.length);
        toast({
          title: 'File attached',
          description: `${selectedFile.name} (${sizeInfo}, ${contentInfo}) is ready for analysis.`,
        });
        
        // Auto-close sidebar on mobile after adding file
        if (isMobile) {
          setOpenMobile(false);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: `There was an error processing "${selectedFile.name}".`,
        });
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (source: string) => {
    setFiles(files.filter(f => f.source !== source));
  };

  const handleUpdateSummary = (source: string, summary: string) => {
    setFiles(prev =>
      prev.map(f =>
        f.source === source ? { ...f, summary } : f
      )
    );
  };

  return (
    <div
      className={cn('p-4 space-y-4 transition-all duration-500', aiTheme && 'bg-cover bg-center')}
      style={{ backgroundImage }}
      data-ai-theme={aiTheme?.id}
    >
      <div className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          URLs
        </h3>
        <Input
          type="url"
          placeholder="Enter a website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isScraping}
        />
        <Button
          variant="outline"
          className="w-full touch-manipulation min-h-[44px]"
          onClick={handleAddUrl}
          disabled={isScraping || !url.trim()}
        >
          {isScraping ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link className="mr-2 h-4 w-4" />
          )}
          {isScraping ? 'Scraping...' : 'Add URL'}
        </Button>
         <div className="space-y-2">
            {urlSources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
                No URLs added.
            </p>
            ) : urlSources.map(file => (
              <SourceCard
                key={file.source}
                file={file}
                onRemove={removeFile}
                onUpdateSummary={handleUpdateSummary}
              />
            ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
         <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Files
        </h3>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf,.md,.csv,.docx"
            multiple
        />
        <Button
            variant="outline"
            className="w-full touch-manipulation min-h-[44px]"
            onClick={() => fileInputRef.current?.click()}
        >
            <Plus className="mr-2 h-4 w-4" />
            Add Files
        </Button>
        <div className="space-y-2">
            {fileSources.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
                No files added.
            </p>
            ) : fileSources.map(file => (
              <SourceCard
                key={file.source}
                file={file}
                onRemove={removeFile}
                onUpdateSummary={handleUpdateSummary}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
