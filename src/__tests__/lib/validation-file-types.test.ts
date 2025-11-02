import { validateFile, validateFileType, VALIDATION_LIMITS } from '@/lib/validation';

describe('File Type Validation - New File Types', () => {
  describe('validateFileType', () => {
    describe('Markdown Files (.md)', () => {
      it('should accept .md files with text/markdown MIME type', () => {
        const file = new File(['# Content'], 'test.md', { type: 'text/markdown' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .md files with text/x-markdown MIME type', () => {
        const file = new File(['# Content'], 'test.md', { type: 'text/x-markdown' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .md files with text/plain MIME type', () => {
        const file = new File(['# Content'], 'README.md', { type: 'text/plain' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .md files with empty MIME type', () => {
        const file = new File(['# Content'], 'notes.md', { type: '' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .MD files (uppercase extension)', () => {
        const file = new File(['# Content'], 'test.MD', { type: 'text/markdown' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
      });
    });

    describe('CSV Files (.csv)', () => {
      it('should accept .csv files with text/csv MIME type', () => {
        const file = new File(['A,B\n1,2'], 'data.csv', { type: 'text/csv' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .csv files with application/vnd.ms-excel MIME type', () => {
        const file = new File(['A,B\n1,2'], 'spreadsheet.csv', { type: 'application/vnd.ms-excel' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .csv files with text/plain MIME type', () => {
        const file = new File(['A,B\n1,2'], 'export.csv', { type: 'text/plain' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .CSV files (uppercase extension)', () => {
        const file = new File(['A,B\n1,2'], 'data.CSV', { type: 'text/csv' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
      });
    });

    describe('DOCX Files (.docx)', () => {
      it('should accept .docx files with correct MIME type', () => {
        const file = new File([new ArrayBuffer(100)], 'document.docx', { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should accept .DOCX files (uppercase extension)', () => {
        const file = new File([new ArrayBuffer(100)], 'report.DOCX', { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
      });

      it('should accept .Docx files (mixed case extension)', () => {
        const file = new File([new ArrayBuffer(100)], 'paper.Docx', { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
      });
    });

    describe('Existing File Types (Backward Compatibility)', () => {
      it('should still accept .txt files', () => {
        const file = new File(['Text content'], 'file.txt', { type: 'text/plain' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should still accept .pdf files', () => {
        const file = new File([new ArrayBuffer(100)], 'document.pdf', { type: 'application/pdf' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('Invalid File Types', () => {
      it('should reject .doc files (old Word format)', () => {
        const file = new File([new ArrayBuffer(100)], 'document.doc', { type: 'application/msword' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid file type');
        expect(result.details).toContain('.txt, .pdf, .md, .csv, .docx');
      });

      it('should reject .xlsx files (Excel)', () => {
        const file = new File([new ArrayBuffer(100)], 'spreadsheet.xlsx', { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });

      it('should reject .json files', () => {
        const file = new File(['{}'], 'data.json', { type: 'application/json' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });

      it('should reject .xml files', () => {
        const file = new File(['<xml/>'], 'data.xml', { type: 'application/xml' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Invalid file type');
      });

      it('should reject files with no extension', () => {
        const file = new File(['content'], 'README', { type: 'text/plain' });
        const result = validateFileType(file);
        
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateFile - Full Validation', () => {
    it('should validate markdown files completely', () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate CSV files completely', () => {
      const file = new File(['A,B\n1,2'], 'data.csv', { type: 'text/csv' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should validate DOCX files completely', () => {
      const file = new File([new ArrayBuffer(1000)], 'doc.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large regardless of type', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.md', { type: 'text/markdown' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });

  describe('VALIDATION_LIMITS constants', () => {
    it('should include all new file types in ALLOWED_FILE_TYPES', () => {
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toContain('.md');
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toContain('.csv');
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toContain('.docx');
    });

    it('should include all new MIME types in ALLOWED_MIME_TYPES', () => {
      expect(VALIDATION_LIMITS.ALLOWED_MIME_TYPES).toContain('text/markdown');
      expect(VALIDATION_LIMITS.ALLOWED_MIME_TYPES).toContain('text/csv');
      expect(VALIDATION_LIMITS.ALLOWED_MIME_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('should still include original file types', () => {
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toContain('.txt');
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toContain('.pdf');
      expect(VALIDATION_LIMITS.ALLOWED_MIME_TYPES).toContain('text/plain');
      expect(VALIDATION_LIMITS.ALLOWED_MIME_TYPES).toContain('application/pdf');
    });

    it('should have exactly 5 allowed file types', () => {
      expect(VALIDATION_LIMITS.ALLOWED_FILE_TYPES).toHaveLength(5);
    });
  });
});
