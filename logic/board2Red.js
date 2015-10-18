module.exports = {
// Check to see if a move to set a token pre-game is legal
// if angular can't prevent moving the other player's Token
// add a check on whose turn and check against token to move
  board2Red: function(cell) {
    // leave stars alone
    if  ((i==5 && (j==3 || j==7))
     || (i==5 && (j==4 || j==8))
     || (i==6 && (j==3 || j==7))
     || (i==6 && (j==3 || j==8))) {
       return cell;
    } else {
     // flip blue pieces over-show the back
     if (tokenSpec.charAt(0)=='b') {
       cell.tokenSpec = 'bback';
       return cell;
     }
    }
  }
}
