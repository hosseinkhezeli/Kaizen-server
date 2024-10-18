import axios from 'axios'; // Import axios for making HTTP requests
import { createClient } from '@vercel/edge-config'; // Import Edge Config client
const EDGE_CONFIG_ID = 'ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm'; // Replace with your actual Edge Config ID
const API_TOKEN = 'b5d60a6e-62ca-4ffb-b49d-0d00899ad934'; // Replace with your Vercel API token
const edgeConfigClient = createClient("https://edge-config.vercel.com/ecfg_1e7ncqy61tzmxkz9fiwwbktab1bm?token=b5d60a6e-62ca-4ffb-b49d-0d00899ad934");
// Utility functions to read and write boards
const readBoardsFromConfig = async () => {
  try{
    const boardsData = await edgeConfigClient.get('boards');

      return typeof boardsData === 'string' ? JSON.parse(boardsData) : boardsData;

  } catch (error) {
    console.error('Error reading boards from Edge Config:', error);
    return { users: [] };
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

const readUsersFromConfig = async () => {
  try{
    const usersData = await edgeConfigClient.get('users');

      return typeof usersData === 'string' ? JSON.parse(usersData) : usersData;

  } catch (error) {
    console.error('Error reading users from Edge Config:', error);
    return { users: [] };
  }
};

const writeUsersToConfig = async (users) => {
  try {
    await axios.post(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/item`, {
      key: 'users',
      value: JSON.stringify(users),
    }, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error writing users to Edge Config:', error);
  }
};

// Get dashboard info
export const getDashboardInfo = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const boards = await readBoardsFromConfig();

  const userBoards = boards.filter(board =>
    board.members.some(member => member.id === userId)
  );

  const userColumns = userBoards.reduce((acc, curr) => {
    acc.push(curr.columns);
    return acc;
  }, []);

  const highPriorityCards = userColumns.flat().reduce((acc, curr) => {
    if (curr?.taskCards?.length) {
      const foundCard = curr.taskCards.find(card => card.priority === 'High');
      if (foundCard) {
        acc.push(foundCard);
      }
    }
    return acc;
  }, []);

  const boardsInfo = userBoards.map(board => ({
    id: board.id,
    title: board.title,
    description: board.description,
    labels: board.labels,
    background: board.background,
  }));

  setTimeout(() => {
    res.json({
      count: userBoards.length,
      data: { boards: boardsInfo, cards: highPriorityCards }
    });
  }, 2000);
};

// Create a board
export const createBoard = async (req, res) => {
  const { title, description, userId } = req.body;
  const users = await readUsersFromConfig();
  const otherUsers = users.filter(user => user?.userId !== userId);
  const user = { ...users.find(user => user.userId === userId) };
  const boards = await readBoardsFromConfig();

  const newBoard = {
    id: `board${boards.length + 1}`,
    title,
    description,
    lists: [],
    members: [{
      id: user?.userId,
      fullName: user?.fullName,
      profilePictureUrl: user?.profilePictureUrl
    }],
    memberCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    background: undefined,
    permissions: 'private',
    labels: [],
    stickers: [],
    activity: []
  };

  user.boards = user.boards ? [...user.boards, newBoard.id] : [newBoard.id];
  boards.push(newBoard);
  await writeBoardsToConfig(boards);
  await writeUsersToConfig([...otherUsers, user]);
  res.status(200).json(newBoard);
};

// Get all boards
export const getAllBoards = async (req, res) => {
  const boards = await readBoardsFromConfig();
  const userBoards = boards.filter(b => b.members.some(member => member.id === req.body.username));

  if (!userBoards.length) {
    return res.status(404).json({ message: 'Board not found' });
  }
  res.json(userBoards);
};

// Get a specific board by ID
export const getBoardById = async (req, res) => {
  const boards = await readBoardsFromConfig();
  const board = boards.find(b => b.id === req.params.id);

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  setTimeout(() => {
    res.json(board);
  }, 2000);
};

// Update a board
export const updateBoard = async (req, res) => {
  const boards = await readBoardsFromConfig();
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
  await writeBoardsToConfig(boards);
  res.json(updatedBoard);
};

// Delete a board
export const deleteBoard = async (req, res) => {
  const boards = await readBoardsFromConfig();
  const boardIndex = boards.findIndex(b => b.id === req.params.id);

  if (boardIndex === -1) {
    return res.status(404).json({ message: 'Board not found' });
  }

  boards.splice(boardIndex, 1);
  await writeBoardsToConfig(boards);
  res.status(204).send();
};

// Assign users to a board as members
export const assignUsersToBoard = async (req, res) => {
  const { boardId, members } = req.body; // members is an array of objects with id, fullName, and profilePictureUrl
  const boards = await readBoardsFromConfig();
  const boardIndex = boards.findIndex(b => b.id === boardId);

  if (boardIndex === -1) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const board = boards[boardIndex];

  // Add members to the board
  members.forEach(member => {
    if (!board.members.some(m => m.id === member.id)) {
      board.members.push(member);
    }
  });

  await writeBoardsToConfig(boards);
  res.json({ message: 'Users assigned to board successfully!' });
};
