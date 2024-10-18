import express from 'express';
import * as boardController from '../controllers/boardController.js'; // Use ES Module syntax
import * as columnController from '../controllers/columnController.js'; // Use ES Module syntax
import * as taskCardController from '../controllers/taskCardController.js'; // Use ES Module syntax

const boardRoutes = express.Router();

// Board routes
boardRoutes.post('/', boardController.createBoard);
boardRoutes.get('/', boardController.getAllBoards);
boardRoutes.get('/:id', boardController.getBoardById);
boardRoutes.put('/:id', boardController.updateBoard);
boardRoutes.delete('/:id', boardController.deleteBoard);
boardRoutes.post('/assign', boardController.assignUsersToBoard);

// Dashboard routes
boardRoutes.get('/dashboard/data', boardController.getDashboardInfo);

// Column routes
boardRoutes.get('/:boardId/columns', columnController.getColumnsByBoardId);
boardRoutes.get('/:boardId/columns/:columnId', columnController.getColumnById);
boardRoutes.put('/:boardId/columns/:columnId', columnController.updateColumn);
boardRoutes.delete('/:boardId/columns/:columnId', columnController.deleteColumn);
boardRoutes.post('/:boardId/columns', columnController.createColumn);

// Task Card routes
boardRoutes.get('/columns/:columnId/cards', taskCardController.getCardsByColumnId);
boardRoutes.get('/columns/:columnId/cards/:cardId', taskCardController.getCardById);
boardRoutes.put('/columns/move-card', taskCardController.updateCard);
boardRoutes.delete('/columns/:columnId/cards/:cardId', taskCardController.deleteCard);
boardRoutes.post('/columns/:columnId/cards/:cardId/members', taskCardController.addMembersToCard);
boardRoutes.post('/columns/:columnId/cards', taskCardController.createCard);

// Export the boardRoutes
export default boardRoutes; // Use ES Module export
