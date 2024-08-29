const fs = require('fs');
const path = require('path');
const {fileWriter} = require("../utility/method");

const boardFilePath = path.join(__dirname, '../database/board_database.json');

// Utility functions to read boards
const readBoardsFromFile = () => {
  const data = fs.readFileSync(boardFilePath, 'utf8');
  return JSON.parse(data).boards;
};
const writeBoardsToFile = (boards) => {
  fileWriter({boards, boardFilePath})
};
const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9); // Simple unique ID generator
};
// Get all columns (lists) of a specific board
exports.getColumnsByBoardId = (req, res) => {
  const { boardId } = req.params;
  const boards = readBoardsFromFile();
  const board = boards?.find?.(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  res.json(board || []);
};

// Get a specific column by ID
exports.getColumnById = (req, res) => {
  const { boardId, columnId } = req.params;
  const boards = readBoardsFromFile();
  const board = boards?.find?.(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const column = board?.columns?.find?.(c => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  res.json(column);
};

// Update a specific column by ID
exports.updateColumn = (req, res) => {
  const { boardId, columnId } = req.params;
  const boards = readBoardsFromFile();
  const board = boards?.find?.(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const columnIndex = board?.columns?.findIndex?.(c => c.id === columnId);
  if (columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const updatedColumn = {
    ...board?.columns?.[columnIndex],
    ...req?.body,
  };

  board.columns[columnIndex] = updatedColumn;
  writeBoardsToFile(boards);
  res.json(updatedColumn);
};

// Delete a specific column by ID
exports.deleteColumn = (req, res) => {
  const { boardId, columnId } = req.params;
  const boards = readBoardsFromFile();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const columnIndex = board.columns.findIndex(c => c.id === columnId);
  if (columnIndex === -1) {
    return res.status(404).json({ message: 'Column not found' });
  }

  board.columns.splice(columnIndex, 1);
  writeBoardsToFile(boards);
  res.status(204).send();
}

// Add this function to your columnController
exports.createColumn = (req, res) => {
  const { boardId } = req.params;
  const { title, position } = req.body; // Expect title and position in the request body
  const boards = readBoardsFromFile();
  const board = boards?.find?.(b => b.id === boardId);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const newColumn = {
    id: generateUniqueId(), // Implement a function to generate unique IDs
    title,
    taskCards: [],
    position
  };

  board?.columns?.push(newColumn); // Assuming 'columns' is the property for columns
  writeBoardsToFile(boards); // Save the updated board back to the file
  res.status(201).json(newColumn); // Return the created column
};
