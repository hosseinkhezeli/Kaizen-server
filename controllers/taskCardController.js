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
    await axios.post(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/items`, {
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

// Get cards of a specific column by column ID
export const getCardsByColumnId = async (req, res) => {
  const { columnId } = req.params; // Extract column ID from request parameters
  const  boards = await readBoardsFromConfig(); // Read all boards

  // Find the board that contains the specified column
  const board = boards.find(b => b.lists && b.lists.some(column => column.id === columnId));

  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  // Find the specific column in the found board
  const column = board.lists.find(column => column.id === columnId);

  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  // Return the cards in the specified column
  res.json(column.taskCards || []);
};

// Get a specific card by ID
export const getCardById = async (req, res) => {
  const { columnId, cardId } = req.params;
  const  boards = await readBoardsFromConfig();

  const board = boards.find(b => b.lists && b.lists.some(column => column.id === columnId));
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find(c => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const card = column.taskCards.find(c => c.id === cardId);
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  res.json(card);
};

// Update a specific card by ID
export const updateCard = async (req, res) => {
  const { originColumnId, destinationColumnId, cardId, boardId } = req.body; // Get IDs from the request body
  const  boards = await readBoardsFromConfig();

  // Find the board by ID
  const board = boards?.find(board => board.id === boardId);
  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  // Find the origin column
  const originColumn = board.columns.find(column => column.id === originColumnId);
  if (!originColumn) {
    return res.status(404).json({ message: 'Origin column not found' });
  }

  // Find the destination column
  const destinationColumn = board.columns.find(column => column.id === destinationColumnId);
  if (!destinationColumn) {
    return res.status(404).json({ message: 'Destination column not found' });
  }

  // Find the task card in the origin column
  const cardIndex = originColumn.taskCards.findIndex(card => card.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: 'Task card not found in the origin column' });
  }

  // Move the task card
  const [updatedCard] = originColumn.taskCards.splice(cardIndex, 1);
  destinationColumn.taskCards.push(updatedCard);

  await writeBoardsToConfig(boards); // Write the updated boards back to the Edge Config
  res.json([originColumn,destinationColumn]);

  // Return the updated columns
};

// Delete a specific card by ID
export const deleteCard = async (req, res) => {
  const { columnId, cardId } = req.params;
  const  boards = await readBoardsFromConfig();

  const board = boards.find(b => b.lists && b.lists.some(column => column.id === columnId));
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find(c => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const cardIndex = column.taskCards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: 'Card not found' });
  }

  column.taskCards.splice(cardIndex, 1);
  await writeBoardsToConfig(boards); // Write the updated boards back to the Edge Config
  res.status(204).send();
};

// Add members to a specific card
export const addMembersToCard = async (req, res) => {
  const { columnId, cardId } = req.params;
  const { members } = req.body; // members is an array of objects with id and fullName
  const  boards = await readBoardsFromConfig();

  const board = boards.find(b => b.lists && b.lists.some(column => column.id === columnId));
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find(c => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const card = column.taskCards.find(c => c.id === cardId);
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  // Add members to the card
  members.forEach(member => {
    if (!card.members) {
      card.members = [];
    }
    // Check if the user is already a member
    if (!card.members.some(m => m.id === member.id)) {
      card.members.push(member);
    }
  });

  await writeBoardsToConfig(boards); // Write the updated boards back to the Edge Config
  res.json({ message: 'Members added to card successfully!', card });
};

// Create a new card
export const createCard = async (req, res) => {
  const { columnId } = req.params;
  const { title, description, startDate, dueDate, labels } = req.body; // Expect these fields in the request body
  const  boards = await readBoardsFromConfig();

  // Find the column by ID
  const column = boards.flatMap(board => board.lists).find(c => c.id === columnId);

  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const newCard = {
    id: generateUniqueId(), // Implement a function to generate unique IDs
    title,
    description,
    startDate,
    dueDate,
    labels,
    checklist: [],
    attachments: [],
    comments: [],
    status: { id: '1', type: 'todo', label: 'To Do' }, // Default status
    priority: 'normal', // Default priority
    assignedTo: [],
    coverImage: null,
    tags: [],
    parentId: null,
  };

  column.taskCards.push(newCard); // Add the new card to the column's taskCards array
  await writeBoardsToConfig(boards); // Write the updated boards back to the Edge Config
  res.status(201).json(newCard); // Return the created card
};
