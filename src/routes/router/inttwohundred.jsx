
require.ensure = (d, c) => c(require);
module.exports = {
  path: 'inttwohundred',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../../pages/evaluate/inttwohundred.jsx'))
    })
  }
}