const fs = require('fs');
const path = require('path');

const boardFilePath = path.join(__dirname, '../database/board_database.json');

// Utility functions to read boards
const readBoardsFromFile = () => {
  const data = fs.readFileSync(boardFilePath, 'utf8');
  return JSON.parse(data).boards;
};
const writeBoardsToFile = (boards) => {
  fs.writeFileSync(boardFilePath, JSON.stringify({ boards }, null, 2));
};

// Get cards of a specific column by column ID
exports.getCardsByColumnId = (req, res) => {
  const { columnId } = req.params; // Extract column ID from request parameters
  const boards = readBoardsFromFile(); // Read all boards

  // Find the board that contains the specified column
  const board = boards.find(
    (b) => b.lists && b.lists.some((column) => column.id === columnId),
  );

  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  // Find the specific column in the found board
  const column = board.lists.find((column) => column.id === columnId);

  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  // Return the cards in the specified column
  res.json(column.taskCards || []);
};

// Get a specific card by ID
exports.getCardById = (req, res) => {
  const { columnId, cardId } = req.params;
  const boards = readBoardsFromFile();

  const board = boards.find(
    (b) => b.lists && b.lists.some((column) => column.id === columnId),
  );
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find((c) => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const card = column.taskCards.find((c) => c.id === cardId);
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  res.json(card);
};

// Update a specific card by ID
exports.updateCard = (req, res) => {
  const { columnId, cardId } = req.params;
  const boards = readBoardsFromFile();

  const board = boards.find(
    (b) => b.lists && b.lists.some((column) => column.id === columnId),
  );
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find((c) => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const cardIndex = column.taskCards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: 'Card not found' });
  }

  const updatedCard = {
    ...column.taskCards[cardIndex],
    ...req.body,
  };

  column.taskCards[cardIndex] = updatedCard;
  writeBoardsToFile(boards);
  res.json(updatedCard);
};

// Delete a specific card by ID
exports.deleteCard = (req, res) => {
  const { columnId, cardId } = req.params;
  const boards = readBoardsFromFile();

  const board = boards.find(
    (b) => b.lists && b.lists.some((column) => column.id === columnId),
  );
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find((c) => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const cardIndex = column.taskCards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return res.status(404).json({ message: 'Card not found' });
  }

  column.taskCards.splice(cardIndex, 1);
  writeBoardsToFile(boards);
  res.status(204).send();
};

// Add members to a specific card
exports.addMembersToCard = (req, res) => {
  const { columnId, cardId } = req.params;
  const { members } = req.body; // members is an array of objects with id and fullName
  const boards = readBoardsFromFile();

  const board = boards.find(
    (b) => b.lists && b.lists.some((column) => column.id === columnId),
  );
  if (!board) {
    return res.status(404).json({ message: 'Column not found in any board' });
  }

  const column = board.lists.find((c) => c.id === columnId);
  if (!column) {
    return res.status(404).json({ message: 'Column not found' });
  }

  const card = column.taskCards.find((c) => c.id === cardId);
  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  // Add members to the card
  members.forEach((member) => {
    if (!card.members) {
      card.members = [];
    }
    // Check if the user is already a member
    if (!card.members.some((m) => m.id === member.id)) {
      card.members.push(member);
    }
  });

  writeBoardsToFile(boards);
  res.json({ message: 'Members added to card successfully!', card });
};

// Add this function to your taskCardController
exports.createCard = (req, res) => {
  const { columnId } = req.params;
  const { title, description, startDate, dueDate, labels } = req.body; // Expect these fields in the request body
  const boards = readBoardsFromFile();

  // Find the column by ID
  const column = boards
    .flatMap((board) => board.lists)
    .find((c) => c.id === columnId);

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
  writeBoardsToFile(boards); // Save the updated board back to the file
  res.status(201).json(newCard); // Return the created card
};
