const fs = require('fs');
const path = require('path');


const boardFilePath = path.join(__dirname, '../database/board_database.json');

// Utility functions to read and write boards
const readBoardsFromFile = () => {
  const data = fs.readFileSync(boardFilePath, 'utf8');
  return JSON.parse(data).boards;
};

const writeBoardsToFile = (boards) => {
  fs.writeFileSync(boardFilePath, JSON.stringify({ boards }, null, 2));
};

// Get dashboard info
exports.getDashboardInfo = (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const boards = readBoardsFromFile();
  const userBoards = boards.filter(board =>
    board.members.some(member => member.id === userId)
  );

  const userColumns = userBoards?.reduce((acc, curr) => {
    if (acc?.length) {
      return [...acc, curr.columns];
    } else {
      return [curr?.columns];
    }
  }, []);

  const highPriorityCards = userColumns?.flat()?.reduce((acc, curr,idx) => {
    // console.log(curr,idx)
    if (curr?.taskCards?.length) {

      const foundCard = curr.taskCards.find(card => card.priority === 'High');
      if (foundCard) {
        acc.push(foundCard); // Add found card to the accumulator
      }
    }
    return acc; // Ensure to return the accumulator
  }, []);

  const boardsInfo = userBoards?.map(board => ({
    id: board.id,
    title: board.title,
    description: board.description,
    labels: board.labels,
    background: board.background,
  }));

  setTimeout(() => {
    res.json({
      count: userBoards.length,
      data: {boards:boardsInfo,cards:highPriorityCards}
    });
  }, 2000); 
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
  const userBoards =boards.filter(b => b.members.find(member=>member.id===req.body.username) ) ;
  if (!userBoards.length) {
    return res.status(404).json({ message: 'Board not found' });
  }
  res.json(userBoards);
};

// Get a specific board by ID
exports.getBoardById = (req, res) => {
  const boards = readBoardsFromFile();
  const board = boards.find(b => b.id === req.params.id);
  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }
  
  setTimeout(() => {
    res.json(board)
  }, 2000); 

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
