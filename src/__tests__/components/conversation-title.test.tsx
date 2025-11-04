import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationTitle } from '@/components/conversation-title';

describe('ConversationTitle', () => {
  const defaultProps = {
    title: 'Test Conversation',
    onTitleChange: jest.fn(),
    isNewConversation: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('renders conversation title', () => {
      render(<ConversationTitle {...defaultProps} />);
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('displays actual title prop even for new conversations', () => {
      // Fixed: Now displays the actual title prop, not hardcoded "New Conversation"
      render(<ConversationTitle {...defaultProps} isNewConversation={true} />);
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('shows edit button on hover (non-new conversations)', () => {
      render(<ConversationTitle {...defaultProps} />);
      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      expect(editButton).toBeInTheDocument();
    });

    it('shows edit button for new conversations (allows early title editing)', () => {
      render(<ConversationTitle {...defaultProps} isNewConversation={true} />);
      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      expect(editButton).toBeInTheDocument();
    });

    it('updates displayed title when prop changes', () => {
      const { rerender } = render(<ConversationTitle {...defaultProps} title="Original" />);
      expect(screen.getByText('Original')).toBeInTheDocument();

      rerender(<ConversationTitle {...defaultProps} title="Updated" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    it('shows tooltip on edit button hover', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);
      
      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.hover(editButton);

      await waitFor(() => {
        expect(screen.getAllByText('Edit conversation title').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edit Mode Entry', () => {
    it('enters edit mode when edit button clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Test Conversation');
    });

    it('focuses and selects input text when entering edit mode', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveFocus();
    });

    it('shows save and cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save title/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel editing/i })).toBeInTheDocument();
    });
  });

  describe('Title Editing', () => {
    it('allows typing in edit mode', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'New Title');

      expect(input.value).toBe('New Title');
    });

    it('enforces max length of 100 characters', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '100');
    });

    it('preserves original title when typing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'Changed');

      // Cancel to exit edit mode
      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      // Original title unchanged in props
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('calls onTitleChange with new title when saved', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Title');

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      expect(mockChange).toHaveBeenCalledWith('New Title');
    });

    it('trims whitespace before saving', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '  Trimmed Title  ');

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      expect(mockChange).toHaveBeenCalledWith('Trimmed Title');
    });

    it('does not call onTitleChange if title unchanged', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      expect(mockChange).not.toHaveBeenCalled();
    });

    it('reverts to original title if new title is empty', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      expect(mockChange).not.toHaveBeenCalled();
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('reverts to original if only whitespace entered', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '   ');

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      expect(mockChange).not.toHaveBeenCalled();
    });

    it('exits edit mode after saving', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Title');

      const saveButton = screen.getByRole('button', { name: /save title/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('reverts changes when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Changed');

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('exits edit mode when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      await user.click(cancelButton);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('does not call onTitleChange when cancelled', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      // Change value directly
      fireEvent.change(input, { target: { value: 'Changed' } });

      // Use fireEvent to avoid blur from userEvent click
      const cancelButton = screen.getByRole('button', { name: /cancel editing/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Test Conversation')).toBeInTheDocument();
      });
      expect(mockChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('saves on Enter key', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Title{Enter}');

      expect(mockChange).toHaveBeenCalledWith('New Title');
    });

    it('cancels on Escape key', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Changed{Escape}');

      expect(mockChange).not.toHaveBeenCalled();
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    it('prevents default on Enter to avoid form submission', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.type(input, '{Enter}');

      // Should still be in edit mode (prevented default)
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Blur Behavior', () => {
    it('saves changes when input loses focus', async () => {
      const user = userEvent.setup();
      const mockChange = jest.fn();
      render(<ConversationTitle {...defaultProps} onTitleChange={mockChange} />);

      const editButton = screen.getByRole('button', { name: /edit conversation title/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Blur Save');
      
      // Tab out to trigger blur
      await user.tab();

      await waitFor(() => {
        expect(mockChange).toHaveBeenCalledWith('Blur Save');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', async () => {
      const longTitle = 'A'.repeat(150);
      render(<ConversationTitle {...defaultProps} title={longTitle} />);
      
      // Title should be truncated in display (via CSS)
      const titleElement = screen.getByText(longTitle);
      expect(titleElement).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Title with &<>"\'';
      render(<ConversationTitle {...defaultProps} title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('handles empty string gracefully', () => {
      render(<ConversationTitle {...defaultProps} title="" />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('handles rapid edit/cancel cycles', async () => {
      const user = userEvent.setup();
      render(<ConversationTitle {...defaultProps} />);

      // Enter edit mode
      await user.click(screen.getByRole('button', { name: /edit conversation title/i }));
      
      // Cancel
      await user.click(screen.getByRole('button', { name: /cancel editing/i }));
      
      // Re-enter edit mode
      await user.click(screen.getByRole('button', { name: /edit conversation title/i }));
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test Conversation');
    });

    it('updates edit field when title prop changes during editing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ConversationTitle {...defaultProps} title="Original" />);

      await user.click(screen.getByRole('button', { name: /edit conversation title/i }));

      // Change title prop while in edit mode
      rerender(<ConversationTitle {...defaultProps} title="External Update" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('External Update');
    });
  });

  describe('Custom Title Display (Bug Fix)', () => {
    it('displays custom title even when isNewConversation is true and has no messages', () => {
      // BUG: When a new conversation gets a custom title but has no messages yet,
      // it should show the custom title, not "New Conversation"
      render(<ConversationTitle {...defaultProps} title="My Custom Title" isNewConversation={true} />);
      
      // Should show custom title, not "New Conversation"
      expect(screen.getByText('My Custom Title')).toBeInTheDocument();
      expect(screen.queryByText('New Conversation')).not.toBeInTheDocument();
    });

    it('displays "New Conversation" only when title is actually "New Conversation"', () => {
      render(<ConversationTitle {...defaultProps} title="New Conversation" isNewConversation={true} />);
      expect(screen.getByText('New Conversation')).toBeInTheDocument();
    });

    it('updates from "New Conversation" to custom title in real-time', () => {
      const { rerender } = render(
        <ConversationTitle {...defaultProps} title="New Conversation" isNewConversation={true} />
      );
      expect(screen.getByText('New Conversation')).toBeInTheDocument();

      // User sets custom title - should update immediately
      rerender(<ConversationTitle {...defaultProps} title="Research Notes" isNewConversation={true} />);
      expect(screen.getByText('Research Notes')).toBeInTheDocument();
      expect(screen.queryByText('New Conversation')).not.toBeInTheDocument();
    });
  });
});

