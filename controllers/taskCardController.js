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
  const { originColumnId, destinationColumnId, cardId,boardId } = req.body; // Get IDs from the request body
  const boards = readBoardsFromFile();

    // Find the board by ID
    const board = JSON.parse(JSON.stringify(boards?.find(board => board.id === boardId)));
    if (!board) {
        throw new Error('Board not found');
    }
    
    // Find the origin column
    const originColumn = board.columns.find(column => column.id === originColumnId);
    if (!originColumn) {
      throw new Error('Origin column not found');
    }
    
    // Find the destination column
    const destinationColumn = board.columns.find(column => column.id === destinationColumnId);
    if (!destinationColumn) {
      throw new Error('Destination column not found');
    }
    
    // Find the task card in the origin column
    const cardIndex = originColumn.taskCards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Task card not found in the origin column');
    }


    // Move the task card
    const [updatedCard] = originColumn.taskCards.splice(cardIndex, 1);
    destinationColumn.taskCards.push(updatedCard);
    const otherColumns = board.columns?.filter((column)=>column.id!==originColumnId||column.id!==destinationColumnId)
    const updatedBoard ={...board,columns:[originColumn,destinationColumn,otherColumns].flat()}

    const updatedBoards = [boards?.filter((board)=>board.id!==boardId),updatedBoard].flat()

console.log(updatedBoards[0])
    // Write the updated boards back to the file
    writeBoardsToFile(updatedBoards);

    // Return the updated card
    return res.json(updatedCard);
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
