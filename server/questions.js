const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, 'db/questions.db')

// open the database
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the questions database!');
});
     


getQuestion = (questionID, packetName, callback) => {
  db.all("SELECT * FROM questions WHERE PacketName = ? AND QuestionId = ?", [packetName, questionID], function(err, rows) {
    question = rows[0]
    // console.log(question)
    db.all("SELECT * FROM answers WHERE PacketName = ? AND QuestionId = ?", [packetName, questionID], (err, answers) => {
      question.answer = answers.map(answer => answer.Answer)
      // console.log(question)
      db.all("SELECT * FROM prompts WHERE PacketName = ? AND QuestionId = ?", [packetName, questionID], (err, prompts) => {
        question.prompts = prompts.map(prompt => prompt.Prompt)
        callback(question)
      })
    })

  });
};

getQuestion(1, "2013 HSAPQ Tournament 33", result => {console.log(result)})

module.exports = { getQuestion };

