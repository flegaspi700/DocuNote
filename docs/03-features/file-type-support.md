# File Type Support

## Overview

DocuNote supports uploading 5 different file types to use as knowledge sources in conversations. Each file type is processed differently to extract text content optimally.

## Supported File Types

### 1. Plain Text Files (.txt)
- **MIME Types:** `text/plain`
- **Processing:** Read directly as UTF-8 encoded text
- **Use Case:** Simple text documents, notes, code snippets
- **Max Size:** 10MB

### 2. PDF Documents (.pdf)
- **MIME Types:** `application/pdf`
- **Processing:** Text extraction using pdf-parse library
- **Use Case:** Reports, research papers, documentation, forms
- **Max Size:** 10MB
- **Note:** Scanned PDFs without OCR may not extract text properly

### 3. Markdown Files (.md)
- **MIME Types:** `text/markdown`, `text/x-markdown`, `text/plain`, or empty
- **Processing:** Read as plain text (formatting preserved as markdown syntax)
- **Use Case:** Documentation, README files, technical notes
- **Max Size:** 10MB
- **Special Handling:** Flexible MIME type checking due to browser inconsistencies

**Example:**
```markdown
# Sample Markdown
- List items preserved
- **Bold** and *italic* formatting
- `Code blocks` maintained
```

### 4. CSV Files (.csv)
- **MIME Types:** `text/csv`, `application/vnd.ms-excel`, `text/plain`
- **Processing:** Parsed with papaparse library and formatted as readable text
- **Use Case:** Data tables, spreadsheets, records
- **Max Size:** 10MB
- **Output Format:**
  ```
  CSV Data from filename.csv
  
  Total rows: 10
  Columns: Name, Age, City
  
  Row 1:
  - Name: John Doe
  - Age: 30
  - City: New York
  ```

### 5. Word Documents (.docx)
- **MIME Types:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Processing:** Text extraction using mammoth library
- **Use Case:** Reports, letters, formatted documents
- **Max Size:** 10MB
- **Note:** Complex formatting (tables, images) may be simplified during extraction

## Implementation Details

### Validation

File validation happens in two stages:

1. **Type Validation** (`src/lib/validation.ts`)
   - File extension check (case-insensitive)
   - MIME type verification
   - Flexible matching for markdown and CSV (multiple MIME types accepted)

2. **Size Validation**
   - Max file size: 10MB (10,485,760 bytes)
   - Enforced before processing

### Parsing Strategy

**File Upload Component** (`src/components/file-upload.tsx`)

```typescript
// Markdown & Plain Text
if (fileExtension === '.md' || fileExtension === '.txt') {
  content = await readFile(selectedFile, 'text') as string;
}

// CSV
else if (fileExtension === '.csv') {
  const csvText = await readFile(selectedFile, 'text') as string;
  const parseResult = Papa.parse(csvText, { 
    header: true, 
    skipEmptyLines: true 
  });
  // Format as readable text with headers and rows
}

// PDF
else if (fileExtension === '.pdf') {
  const arrayBuffer = await readFile(selectedFile, 'arrayBuffer');
  const pdfData = await pdfParse(Buffer.from(arrayBuffer));
  content = pdfData.text;
}

// DOCX
else if (fileExtension === '.docx') {
  const arrayBuffer = await readFile(selectedFile, 'arrayBuffer');
  const result = await mammoth.extractRawText({ arrayBuffer });
  content = result.value;
}
```

## Libraries Used

- **mammoth** (^1.8.0) - DOCX text extraction
- **papaparse** (^5.4.1) - CSV parsing
- **pdf-parse** - PDF text extraction (existing)

## Browser Compatibility Notes

Different browsers report different MIME types for certain file extensions:

- **Markdown (.md):** May be `text/markdown`, `text/x-markdown`, `text/plain`, or empty
- **CSV (.csv):** May be `text/csv`, `application/vnd.ms-excel`, or `text/plain`

Our validation logic handles these variations gracefully.

## Testing

### Validation Tests (`src/__tests__/lib/validation-file-types.test.ts`)
- 27 comprehensive tests covering:
  - All 5 file types with various MIME types
  - Backward compatibility with .txt and .pdf
  - Invalid file type rejection
  - Size limit enforcement
  - Case-insensitive extension handling

### Component Tests (`src/__tests__/components/file-upload.test.tsx`)
- 13 new file upload tests covering:
  - Successful file processing for each type
  - Error handling (parsing errors, read errors)
  - MIME type variations
  - Mixed file type uploads

## Limitations

1. **PDF:** Scanned PDFs without embedded text won't extract content
2. **DOCX:** Complex formatting (tables, images, charts) simplified to plain text
3. **CSV:** Very large CSV files may take longer to parse
4. **File Size:** 10MB limit applies to all file types
5. **Encoding:** Files must be UTF-8 encoded (except PDF/DOCX which are binary)

## Future Enhancements

Potential file types to add:
- Excel files (.xlsx)
- PowerPoint presentations (.pptx)
- HTML files (.html)
- RTF documents (.rtf)
- EPUB books (.epub)

## Error Messages

- **Invalid File Type:** "Please upload a .txt, .pdf, .md, .csv, or .docx file"
- **File Too Large:** "File must be smaller than 10MB"
- **Parse Error:** "Failed to parse [file type] file"
- **Read Error:** "Error reading file"

## See Also

- [Input Validation Testing](../02-testing/input-validation-testing.md)
- [Manual Test Scenarios](../02-testing/manual-test-scenarios.md)
- [Validation Constants Reference](../05-reference/validation-constants.md)
