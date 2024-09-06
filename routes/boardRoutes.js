const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const columnController = require('../controllers/columnController');
const taskCardController = require('../controllers/taskCardController');

// Board routes
router.post('/', boardController.createBoard);
router.get('/', boardController.getAllBoards);
router.get('/:id', boardController.getBoardById);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);
router.post('/assign', boardController.assignUsersToBoard);

//Dashboard routes
router.get('/dashboard/data', boardController.getDashboardInfo);
// Column routes
router.get('/:boardId/columns', columnController.getColumnsByBoardId);
router.get(
  '/:boardId/columns/:columnId',
  columnController.getColumnById,
);
router.put('/:boardId/columns/:columnId', columnController.updateColumn);
router.delete(
  '/:boardId/columns/:columnId',
  columnController.deleteColumn,
);
router.post('/:boardId/columns', columnController.createColumn);
// Task Card routes
router.get('/columns/:columnId/cards', taskCardController.getCardsByColumnId);
router.get('/columns/:columnId/cards/:cardId', taskCardController.getCardById);
router.put('/columns/:columnId/cards/:cardId', taskCardController.updateCard);
router.delete(
  '/columns/:columnId/cards/:cardId',
  taskCardController.deleteCard,
);
router.post(
  '/columns/:columnId/cards/:cardId/members',
  taskCardController.addMembersToCard,
);
router.post('/columns/:columnId/cards', taskCardController.createCard);

// Export the router
module.exports = router;
