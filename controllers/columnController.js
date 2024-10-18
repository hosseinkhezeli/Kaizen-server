import axios from 'axios'; // Import axios for making HTTP requests
import path from 'path';

const EDGE_CONFIG_ID = 'ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm'; // Replace with your actual Edge Config ID
const API_TOKEN = 'b5d60a6e-62ca-4ffb-b49d-0d00899ad934'; // Replace with your Vercel API token

// Utility functions to read and write boards
const readBoardsFromConfig = async () => {
  try {
    const response = await axios.get(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item/boards`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
    return response.data ? JSON.parse(response.data.value) : { boards: [] };
  } catch (error) {
    console.error('Error reading boards from Edge Config:', error);
    return { boards: [] };
  }
};

const writeBoardsToConfig = async (boards) => {
  try {
    await axios.post(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item`, {
      key: 'boards',
      value: JSON.stringify(boards),
    }, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error writing boards to Edge Config:', error);
  }
};

const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9); // Simple unique ID generator
};

// Get all columns (lists) of a specific board
export const getColumnsByBoardId = async (req, res) => {
  const { boardId } = req.params;
  const { boards } = await readBoardsFromConfig();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  res.json(board.columns || []);
};

// Get a specific column by ID
export const getColumnById = async (req, res) => {
  const { boardId, columnId } = req.params;
  const { boards } = await readBoardsFromConfig();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const column = board.columns.find(c => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  res.json(column);
};

// Update a specific column by ID
export const updateColumn = async (req, res) => {
  const { boardId, columnId } = req.params;
  const { boards } = await readBoardsFromConfig();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const columnIndex = board.columns.findIndex(c => c.id === columnId);
  if (columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const updatedColumn = {
    ...board.columns[columnIndex],
    ...req.body,
  };

  board.columns[columnIndex] = updatedColumn;
  await writeBoardsToConfig(boards);
  res.json(updatedColumn);
};

// Delete a specific column by ID
export const deleteColumn = async (req, res) => {
  const { boardId, columnId } = req.params;
  const { boards } = await readBoardsFromConfig();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const columnIndex = board.columns.findIndex(c => c.id === columnId);
  if (columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  board.columns.splice(columnIndex, 1);
  await writeBoardsToConfig(boards);
  res.status(204).send();
};

// Create a new column
export const createColumn = async (req, res) => {
  const { boardId } = req.params;
  const { title, position } = req.body; // Expect title and position in the request body
  const { boards } = await readBoardsFromConfig();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const newColumn = {
    id: generateUniqueId(),
    title,
    taskCards: [],
    position,
  };

  board.columns.push(newColumn);
  await writeBoardsToConfig(boards);
  res.status(201).json(newColumn);
};
