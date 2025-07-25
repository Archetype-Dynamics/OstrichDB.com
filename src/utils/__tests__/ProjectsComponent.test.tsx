import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProjectsComponent from '../../components/dashboard/ProjectsComponent';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Projects Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
      <ProjectsComponent/>
      </MemoryRouter>
    );
  });

  test('renders the Projects dashboard components initial elements', () => {
    expect(screen.getByText('Create project')).toBeInTheDocument();
    expect(screen.getByText('Example project')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Will be displayed if user doesn\'t have a any projects created yet.'
      )
    ).toBeInTheDocument();
  });

  test('opens the modal when "Create project" button is clicked', async () => {
    const createButton = screen.getByText('Create project');
    await userEvent.click(createButton);

    expect(screen.getByPlaceholderText('Enter name of project')).toBeInTheDocument();
    // expect(screen.getByPlaceholderText('Add collaborator?')).toBeInTheDocument(); // COMMENTED OUT - collaborators feature disabled
    expect(screen.getByPlaceholderText('Enter password for project')).toBeInTheDocument();
  });

  test('closes the modal when "Cancel" button is clicked', async () => {
    const createButton = screen.getByText('Create project');
    await userEvent.click(createButton);

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(screen.queryByPlaceholderText('Enter name of project')).not.toBeInTheDocument();
  });

  test('handles input changes correctly', async () => {
    const createButton = screen.getByText('Create project');
    await userEvent.click(createButton);

    const nameInput = screen.getByPlaceholderText('Enter name of project');
    // const emailInput = screen.getByPlaceholderText('Add collaborator?'); // COMMENTED OUT - collaborators feature disabled
    const passwordInput = screen.getByPlaceholderText('Enter password for project');

    await userEvent.type(nameInput, 'Test Project');
    // await userEvent.type(emailInput, 'test@example.com'); // COMMENTED OUT - collaborators feature disabled
    await userEvent.type(passwordInput, 'secure123');

    expect(nameInput).toHaveValue('Test Project');
    // expect(emailInput).toHaveValue('test@example.com'); // COMMENTED OUT - collaborators feature disabled
    expect(passwordInput).toHaveValue('secure123');
  });

  test('submits the form with project data', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const createButton = screen.getByText('Create project');
    await userEvent.click(createButton);

    await userEvent.type(screen.getByPlaceholderText('Enter name of project'), 'Test Project');
    await userEvent.type(screen.getByPlaceholderText('Enter password for project'), 'secure123');

    const submitButton = screen.getByText('Create Project');
    await userEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith('Project created:', {
      name: 'Test Project',
      // collaborators: '', // COMMENTED OUT - collaborators feature disabled
      password: 'secure123'
    });

    // Modal should close after submission
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Enter name of project')).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('requires name and password fields', async () => {
    const createButton = screen.getByText('Create project');
    await userEvent.click(createButton);

    const submitButton = screen.getByText('Create Project');
    await userEvent.click(submitButton);

    // The form should still be open since required fields are missing
    expect(screen.getByPlaceholderText('Enter name of project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password for project')).toBeInTheDocument();
  });
});