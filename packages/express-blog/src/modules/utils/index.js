function parsePagination(params) {
  return [
    Math.max(parseInt(params.page, 10) || 1, 1),
    Math.max(parseInt(params.pageSize, 10) || 100, 100)
  ];
}

module.exports = {
  parsePagination
};
