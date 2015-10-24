module.exports =
{
  // Check to see if a move to set a token pre-game is legal

  checkSet : function(org,dst) {
    console.log('checkSet.......');
    console.log(org.row, org.col, org.color, org.rank, dst.row, dst.col, dst.color, dst.rank);
    // bad data
    if ((org.row == dst.row) && (org.col == dst.col)) return 'same space';
    // are coords within the appropriate staging area or tray (blue)
    if (org.color == 'blue') {
      if ((dst.row > 6) || (dst.row > 10 && dst.row < 15)) {
        return 'out of bounds';
        // make sure we're trying to move into an empty cell
      } else if (dst.rank != 'empty') {
        return 'occupied'
      } else {
        return 'move to empty space';
      }
      // are coords within the appropriate staging area or tray (blue)
    } else if (org.color == 'red') {
      if ((dst.r > 6) || ((dst.row < 11 ) && (dst.row > 14))) {
        console.log('Red dstRow ' + dst.row);
        return 'out of bounds';
        // make sure we're trying to move into an empty cell
      } else if (dst.rank != 'empty') {
        return 'occupied'
      } else {
        return 'move to empty space';
      }
    } else {
      return 'not a token';
    }
    console.log('exit checkSet');
  }
};
