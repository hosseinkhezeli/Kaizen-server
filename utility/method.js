const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9); // Simple unique ID generator
};
module.exports = generateUniqueId
