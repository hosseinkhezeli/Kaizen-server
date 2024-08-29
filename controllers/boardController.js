const fs = require('fs');
const path = require('path');
const {fileWriter} = require("../utility/method");

const boardFilePath = path.join(__dirname, '../database/board_database.json');

// Utility functions to read and write boards
const readBoardsFromFile = () => {
  const data = fs.readFileSync(boardFilePath, 'utf8');
  return JSON.parse(data).boards;
};

const writeBoardsToFile = (boards) => {
  fileWriter({boards,boardFilePath})
};

// Create a board
exports.createBoard = (req, res) => {
  const { title, description } = req.body;
  const boards = readBoardsFromFile();
  const newBoard = {
    id: `board${boards.length + 1}`,
    title,
    description,
    lists: [],
    members: [],
    memberCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    background: '',
    permissions: 'private',
    labels: [],
    stickers: [],
    activity: []
  };
  boards.push(newBoard);
  writeBoardsToFile(boards);
  res.status(201).json(newBoard);
};

// Get all boards
exports.getAllBoards = (req, res) => {
  const boards = readBoardsFromFile();
  res.json(boards);
};

// Get a specific board by ID
exports.getBoardById = (req, res) => {
  const boards = readBoardsFromFile();
  const board = boards.find(b => b.id === req.params.id);
  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }
  res.json(board);
};

// Update a board
exports.updateBoard = (req, res) => {
  const boards = readBoardsFromFile();
  const boardIndex = boards.findIndex(b => b.id === req.params.id);
  if (boardIndex === -1) {
    return res.status(404).json({ message: 'Board not found' });
  }
  const updatedBoard = {
    ...boards[boardIndex],
    ...req.body,
    updatedAt: new Date()
  };
  boards[boardIndex] = updatedBoard;
  writeBoardsToFile(boards);
  res.json(updatedBoard);
};

// Delete a board
exports.deleteBoard = (req, res) => {
  const boards = readBoardsFromFile();
  const boardIndex = boards.findIndex(b => b.id === req.params.id);
  if (boardIndex === -1) {
    return res.status(404).json({ message: 'Board not found' });
  }
  boards.splice(boardIndex, 1);
  writeBoardsToFile(boards);
  res.status(204).send();
};

// Assign users to a board as members
exports.assignUsersToBoard = (req, res) => {
  const { boardId, members } = req.body; // members is an array of objects with id, fullName, and profilePictureUrl
  const boards = readBoardsFromFile();
  const boardIndex = boards.findIndex(b => b.id === boardId);

  if (boardIndex === -1) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const board = boards[boardIndex];

  // Add members to the board
  members.forEach(member => {
    // Check if the user is already a member
    if (!board.members.some(m => m.id === member.id)) {
      board.members.push(member);
    }
  });

  writeBoardsToFile(boards);
  res.json({ message: 'Users assigned to board successfully!', board });
}
