const { GameState } = require('../config.js');

const questionModule = require('./questions.js')

const createRoom = (userID, roomID) => {
  return {
    roomID : roomID,
    users : [userID],
    packet : null,
    questionNumber : null,
    questionSource: {

    },
    questionStatus : {
      wordIndex : null,
      inPower : false,
      wordDelay : null,
      powerWords : [],
      questionWords : [],
    },
    gameStatus : {
      stats: {userID: initStats()},
      buzzedUser : null,
    },
    answerStatus : {
      buzzTimeout : null,
      answerTimeout : null,
    },
    state : GameState.LOBBY,
    interval : null,
    gameTick : 20,
  }
};


const joinRoom = (room, userID) => {
  room.users.push(userID);
  room.stats[userID] = initStats();
};

const enterGame = (room) => {
  console.log("entering a game");
  room.state = GameStatus.LOBBY;
};

const nextQuestion = (room) => {
  getQuestion(room.questionNumber, room.packet, (question) => {
    room.questionNumber += 1;
    room.questionSource = question;
    room.questionStatus.powerWords = question.Power.split(" ");
    room.questionStatus.questionWords = question.Question.split(" ");
    room.questionStatus.wordIndex = 0;
    room.questionStatus.wordDelay = 0;
    room.questionStatus.inPower = true;
    room.state = GameState.PLAYING;
  });
};

const processAnswer = (answer, userID, room) => {
  const answers = answer.split(" ")
  console.log(room);
  for (let i in answers) {
    if (room.questionSource.answer.includes(answers[i])) {
      room.questionStatus.inPower ? room.gameStatus.stats[userID] += 15 : room.gameStatus.stats[userID] += 10;
      return true;
    }
  }
  if (room.state === GameState.INTERRUPT) {
    room.gameStatus.stats[userID] -= 5;
  }
  return false
};


const initStats = () => {
  return {
    score : 0,
  }
};


module.exports = { processAnswer, nextQuestion, enterGame, createRoom, joinRoom };

