import { GameStatus } from '../config.js';

const createRoom = (userID, roomID) => {
  return {
    roomID : roomID,
    stats: {userID: initStats()},
    users : {userID},
    packet : null,
    questionNumber : null,
    state : GameStatus.LOBBY,
  }
};


const initStats = () => {
  return {
    score : 0,
  }
};
module.exports = { createRoom };

