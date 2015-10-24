  var teamColor = '';
  var lastRed = false;
  var lastBlue = false;
  var loggedIn;
  var heartBeat = 0;
  // delcare app
  var app = angular.module('warpApp', ['ngRoute', 'ngResource', 'firebase']);

  var tokRedRef = new Firebase('https://warp-attack-3.firebaseIO.com/red');
  var tokBlueRef = new Firebase('https://warp-attack-3.firebaseIO.com/blue');
  var playersRef = new Firebase('https://warp-attack-3.firebaseIO.com/players');

  // make a factory to render board views/functions
  angular.module('warpApp')
    .factory('tokenFactory', ['$http', '$firebaseObject', function($http,$firebaseObject) {
      var tokenUrl = '/tokens/';
      var tokenSetTraysUrl = '/tokens/trays';
      var tokenSetRedTrayUrl = '/tokens/redtray';
      var tokenSetRedFieldUrl = '/tokens/redfield';
      var tokenSetBlueTrayUrl = '/tokens/bluetray';
      var tokenSetBlueFieldUrl = '/tokens/bluefield';
      var tokenMoveTokenUrl = '/tokens/move';
      var playerTurnUrl = '/players/turn';

      var tokenFactory = { };

      tokenFactory.getRedTokens = function() {
        var data = $firebaseObject(tokRedRef);
        console.log('getRedTokens');
        return data;
      }

      tokenFactory.getBlueTokens = function() {
        var data = $firebaseObject(tokBlueRef);
        return data;
      }

      tokenFactory.setRedTray = function() {
        // set both to make sure nothing is missed-temp
        var data = $http.put(tokenSetRedTrayUrl);
        return data;
      }

      tokenFactory.setRedField = function() {
        var data = $http.put(tokenSetRedFieldUrl);
        return data;
      }

      tokenFactory.setBlueTray = function() {
        // set both to make sure nothing is missed-temp
        var data = $http.put(tokenSetBlueTrayUrl);
        return data;
      }

      tokenFactory.setBlueField = function() {
        var data = $http.put(tokenSetBlueFieldUrl);
        return data;
      }

      tokenFactory.setTrays = function() {
        console.log('angular app setTrays');
        var data = $http.put(tokenSetTraysUrl);
        return data;
      }

      tokenFactory.moveToken = function(move) {
      var data = $http({
        method: 'PUT',
        url: tokenMoveTokenUrl,
        data: move,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        return data;
      }

      return tokenFactory;
  }]);

  angular.module('warpApp')
    .factory('redFactory', ['$http', '$firebaseArray', function($http,$firebaseArray) {
      var ref = new Firebase('https://warp-attack-3.firebaseIO.com/red');
      return $firebaseArray(ref);
  }]);

  angular.module('warpApp')
    .factory('blueFactory', ['$http', '$firebaseArray', function($http,$firebaseArray) {
      var ref = new Firebase('https://warp-attack-3.firebaseIO.com/blue');
      return $firebaseArray(ref);
  }]);

  app.filter('leftTray', function() {
    return function(objs) {
      var filtered = [ ];
      for (var key in objs) {
        if (objs[key].row >=11 && objs[key].row<=14) {
            filtered.push(objs[key]);
        }
      }
      return filtered;
    }
  });

  app.filter('board', function() {
    return function(objs) {
      var filtered = [ ];
      for (var key in objs) {
        if (objs[key].row >=1 && objs[key].row<=10) {
            filtered.push(objs[key]);
        }
      }
      return filtered;
    }
  });

  app.filter('rightTray', function() {
    return function(objs) {
      var filtered = [ ];
      for (var key in objs) {
        if (objs[key].row >=15 && objs[key].row<=18) {
            filtered.push(objs[key]);
        }
      }
      return filtered;
    }
  });

  angular.module('warpApp')
    .controller('BoardCtrl', ['$scope','$http','$rootScope', 'tokenFactory', 'redFactory', 'blueFactory',
               'statusService', function($scope,$http,$rootScope,tokenFactory, redFactory, blueFactory, statusService) {
      console.log('HELLO WORLD');
      $scope.colSortOrder = 'parseInt(col)';
      $scope.rowSortOrder = 'parseInt(row)';
      var col0;
      var row0;
      var col1;
      var row1;
      var activeCell = { row: 0, col: 0};
      var verb;

      playersRef.on('child_changed', function(childSnapshot, prevChildKey) {
        console.log('There has been a playersRef change');
      });
      // if I'm logging in, make sure my pieces are in the tray.
      playersRef.on('value', function(snapshot) {
        console.log('players child changed');
        $scope.turn = snapshot.val().turn;
        $scope.redPresent = snapshot.val().red;
        $scope.bluePresent = snapshot.val().blue;
        lastRed = snapshot.val().red;
        lastBlue = snapshot.val().blue;
        //  craft a message - 1st get data
        lastOrg = snapshot.val().lastOrg;
        lastDst = snapshot.val().lastDst;
        lastMover = snapshot.val().lastMover;
        lastPrey = snapshot.val().lastPrey;
        lastMoverSurvived = snapshot.val().lastMoverSurvived;
        lastPreySurvived = snapshot.val().lastPreySurvived;

        //
        if (teamColor == 'blue') {
          col0 = 11 - lastOrg.col;
          row0 = 11 - lastOrg.row;
          col1 = 11 - lastDst.col;
          row1 = 11 - lastDst.row;
        } else {
          col0 = lastOrg.col;
          row0 = lastOrg.row;
          col1 = lastDst.col;
          row1 = lastDst.row;
        }
        if ($scope.moveResult=='win') {
          $scope.moveMessage = lastMover.color + ' has won!';
        } else if ($scope.turn == 'setup') {
          $scope.moveMessage = 'waiting for players to finish setting up tokens';
        } else if ($scope.moveMessage == 'waiting for players to finish setting up tokens') {
          $scope.moveMessage = 'waiting for ' + $scope.turn + ' to make a move.';
        } else {
          $scope.moveMessage = 'It\'s ' + $scope.turn + '\'s turn. Last move was from'
          + ' row ' + row0 + ', col ' + col0 + ' to row ' + row1 + ', col ' + col1;
        }
        if (lastMover.color != 'none' && lastPrey.color != 'none') {
          if (lastMoverSurvived && !lastPreySurvived) {
            verb = ' took out ';
          } else if (!lastMoverSurvived && lastPreySurvived) {
            verb = ' lost to ';
          } else {
            verb = ' took itself out and with it ';
          };
          $scope.battleMessage = 'In the last melee, ' + lastMover.color + ' ' +
          lastMover.rank + verb + lastPrey.color + ' ' + lastPrey.rank;
        }
        $scope.loggedIn = ((teamColor=='red') || (teamColor=='blue'));
        $scope.myColor = teamColor;
        console.log('team color ' + teamColor);
        // showBoard();
        // $scope.loggedIn = loggedIn;

        // function showBoard() {
          // console.log('showBoard ' + teamColor);
          if (teamColor == 'blue') {
            $scope.leftTray = blueFactory;
            $scope.board = blueFactory;
            $scope.rightTray = blueFactory;
            console.log('blueFactory');
            console.log(blueFactory);

          } else {
            $scope.leftTray = redFactory;
            $scope.board = redFactory;
            $scope.rightTray = redFactory;
            console.log('redFactory');
            console.log(redFactory);
          }

    });

      $scope.moveToken = function() {

        if (teamColor=='blue') {
          if (oRow < 11) {
            var oRow = 11-$scope.orgRow;
            var oCol = 11-$scope.orgCol;
          }
          if (drow < 11) {
            var dRow = 11-$scope.dstRow;
            var dCol = 11-$scope.dstCol;
          }
        } else {
          var oRow = $scope.orgRow;
          var oCol = $scope.orgCol;
          var dRow = $scope.dstRow;
          var dCol = $scope.dstDst;
        }
          console.log('angular-app ' + oRow,oCol,dRow,dCol);
          var data = $.param({
                  orgRow: oRow,
                  orgCol: oCol,
                  dstRow: dRow,
                  dstCol: dCol})
          tokenFactory.moveToken(data).success(function() {
          }).error(function(error) {
            // console.log('error: ' + error.message);
        })
      }
 
      $scope.setRedTray = function() {
        if (teamColor=='red') {
          tokenFactory.setRedTray();
        }
      }

      $scope.setBlueTray = function() {
        if (teamColor=='blue') {
          tokenFactory.setBlueTray();
        }
      }

      $scope.setRedField = function() {
        if (teamColor=='red') {
          tokenFactory.setRedField();
        }
      }

      $scope.setBlueField = function() {
        if (teamColor=='blue') {
          tokenFactory.setBlueField();
        }
      }

      $scope.startGameRed = function() {
        if (teamColor=='red') {
          playersRef.update({ turn: 'red' });
        }
      }

      $scope.startGameBlue = function() {
        if (teamColor=='blue') {
          playersRef.update({ turn: 'blue' });
        }
      }

      $scope.redButtons = function() {
        if (teamColor=='red') {
          return 'vertical';
        } else {
          return 'vertical dark';
        }
      }

      $scope.blueButtons = function() {
        if (teamColor=='blue') {
          return 'vertical';
        } else {
          return 'vertical dark';
        }
      }

      $scope.setTrays = function() {
        tokenFactory.setTrays();
      }

      $scope.isActive = function(cell) {
        if ((cell.row==activeCell.row)
         &&((cell.col==activeCell.col)))
         {
          return true;
        }
      }

      $scope.oRow =0;
      $scope.dRow = 0;
      // token selection and target cell selection
      $scope.activate = function(cell,$index) {
        console.log('cell index: ' + $index);
        if ($scope.turn=='setup' || $scope.turn==teamColor) {
          if ((activeCell.row != 0) && (activeCell.col !=0)) {
            // click an active cell again to de-activate it
            if (cell.row==activeCell.row && cell.col==activeCell.col) {
              activeCell.row = 0;
              activeCell.col = 0;
            } else if (teamColor=='blue') {
              // translate for blue inside field
              console.log('blue status: ' + activeCell.row, activeCell.col, cell.row, cell.col);
              if (activeCell.row < 11) {
                $scope.oRow = 11-parseInt(activeCell.row);
                $scope.oCol = 11-parseInt(activeCell.col);
              } else {
                $scope.oRow = parseInt(activeCell.row);
                $scope.oCol = parseInt(activeCell.col);
              }
              // translate for blue inside the field
              if ($scope.dRow < 11) {
                $scope.dRow = 11-cell.row;
                $scope.dCol = 11-cell.col;
              } else {
                $scope.dRow = cell.row;
                $scope.dCol = cell.row;
              }
              console.log('blue status after translate: ' + $scope.oRow, $scope.oCol, $scope.dRow, $scope.dCol);
              var data = $.param({
                      orgRow: $scope.oRow,
                      orgCol: $scope.oCol,
                      dstRow: $scope.dRow,
                      dstCol: $scope.dCol})
              tokenFactory.moveToken(data).success(function(){
                // de-activate cell after move
                activeCell.row = 0;
                activeCell.col = 0;
                playersRef.update({ })
              });
              console.log($scope.oRow, $scope.oCol, $scope.dRow, $scope.dCol, 'blue');
            } else if (teamColor=='red'){
              $scope.oRow = activeCell.row;
              $scope.oCol = activeCell.col;
              $scope.dRow = cell.row;
              $scope.dCol = cell.col;

              var data = $.param({
                      orgRow: $scope.oRow,
                      orgCol: $scope.oCol,
                      dstRow: $scope.dRow,
                      dstCol: $scope.dCol})
                      console.log('Move data ' + $scope.oRow,$scope.oCol,$scope.dRow,$scope.dCol);
              tokenFactory.moveToken(data).success(function(){
                // de-activate cell after move
                activeCell.row = 0;
                activeCell.col = 0;
              });
            }
          } else {
            activeCell.row = cell.row;
            activeCell.col = cell.col;
          }
        }
      }
  }]);

  angular.module('warpApp')
    .factory('statusService', [ '$http', '$q', function($http, $q) {
      return {
        setRedPresence: function() {
          playersRef.update({ red: true });
        },
        setBluePresence: function() {
          playersRef.update({ blue: true });
        },
        endRedPresence: function() {
          playersRef.update({ red: false, turn: 'setup' });
        },
        endBluePresence: function() {
          playersRef.update({ blue: false, turn: 'setup' });
        }
      }
    }])
    .controller('PlayerCtrl', ['$scope', '$route', '$http', 'statusService', 'tokenFactory', '$timeout',
                                  function($scope, $route, $http, statusService,tokenFactory, $timeout) {

      $scope.getTurn = function() {
          var data = $http.get('/players/turn').then(function(res) {
          $scope.turn = res.data.turn;
          console.log('getTurn');
          console.log($scope.turn);

          return res.data.turn;
        })
      };

      $scope.showMoveStatus = function() {
        $scope.movement = statusService.getMovement();
      };

      function showRedPresence() {
        console.log('showRedPresence');
        console.log(statusService.getRedPresence());
      };

      function showBluePresence() {
        console.log('showBluePresence');
        $scope.bluepresent = statusService.getBluePresence();
      };

      $scope.chooseRed = function() {
        teamColor = 'red';
        statusService.setRedPresence();
      };

      $scope.chooseBlue = function() {
        teamColor = 'blue';
        statusService.setBluePresence();
      };

      $scope.logOutRed = function() {
        statusService.endRedPresence();
      };

      $scope.logOutBlue = function() {
        statusService.endBluePresence();
      };


  }]);
