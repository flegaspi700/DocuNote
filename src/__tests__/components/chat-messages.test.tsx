import { render, screen } from '@testing-library/react';
import { ChatMessages } from '@/components/chat-messages';
import { mockConversation } from '../__mocks__/mockMessages';

const mockEditHandlers = {
  editingMessageId: null,
  editedContent: '',
  isStreaming: false,
  onEditStart: jest.fn(),
  onEditCancel: jest.fn(),
  onEditSave: jest.fn(),
  onEditContentChange: jest.fn(),
};

describe('ChatMessages', () => {
  it('renders empty state when no messages and no files', () => {
    render(<ChatMessages messages={[]} hasFiles={false} {...mockEditHandlers} />);
    
    expect(screen.getByText(/Welcome to DocuNote/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload documents.*\.txt.*\.pdf.*\.docx.*\.md.*\.csv/i)).toBeInTheDocument();
  });

  it('renders prompt to ask questions when files exist but no messages', () => {
    render(<ChatMessages messages={[]} hasFiles={true} {...mockEditHandlers} />);
    
    expect(screen.getByText(/ask a question/i)).toBeInTheDocument();
  });

  it('renders all messages in conversation', () => {
    render(<ChatMessages messages={mockConversation} hasFiles={true} {...mockEditHandlers} />);
    
    expect(screen.getByText(/When was the term AI coined?/i)).toBeInTheDocument();
    expect(screen.getByText(/John McCarthy in 1956/i)).toBeInTheDocument();
    expect(screen.getByText(/Who proposed the Turing Test?/i)).toBeInTheDocument();
    expect(screen.getByText(/Alan Turing proposed/i)).toBeInTheDocument();
  });

  it('distinguishes between user and AI messages', () => {
    render(<ChatMessages messages={mockConversation} hasFiles={true} {...mockEditHandlers} />);
    
    // Verify all messages are rendered
    expect(screen.getByText(/When was the term AI coined?/i)).toBeInTheDocument();
    expect(screen.getByText(/John McCarthy in 1956/i)).toBeInTheDocument();
    expect(screen.getByText(/Who proposed the Turing Test?/i)).toBeInTheDocument();
    expect(screen.getByText(/Alan Turing proposed/i)).toBeInTheDocument();
  });

  it('renders messages in correct order', () => {
    render(<ChatMessages messages={mockConversation} hasFiles={true} {...mockEditHandlers} />);
    
    // Verify first user message and first AI response
    expect(screen.getByText(/When was the term AI coined?/i)).toBeInTheDocument();
    expect(screen.getByText(/John McCarthy in 1956/i)).toBeInTheDocument();
  });
});
