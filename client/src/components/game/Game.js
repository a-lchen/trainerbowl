import React from "react";
import io from "socket.io-client";

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.socket = io("http://localhost:3000");
    this.socket.emit("joinRoom", {roomID: this.props.match.params.roomID});
    this.state = {
      question: "",
      buzzed : false,
      answer: null,
    }
  }

  handleKeyPress = (event) => {
    if (event.keyCode === 32) {
      console.log("buzz!");
      this.socket.emit("buzz");
    }
    else if (event.keyCode === 13) {
      console.log("enter!");
      this.socket.emit("answer", {answer: this.state.answer});
    }
    else if (event.keyCode === 78) {
      console.log("n");
      this.socket.emit("nextQuestion");
    }

  };

  componentDidMount() {
    this.socket.on("gameUpdate", data => {
      console.log(data.word);
      let updatedQuestion = this.state.question + " " + data.word;
      this.setState({question : updatedQuestion});

    });

    this.socket.on("buzzAck", data => {
      console.log("ack buzz");
      if (data.valid) {
        console.log("valid");
        this.setState({buzzed: true});
      }
    });

    this.socket.on("nextQuestionAck" , () => {
      this.setState({question: ""});
    });

    this.socket.on("playerAnswer", data => {
      console.log(data);
      this.setState({buzzed : false});
    });

    document.addEventListener('keydown', this.handleKeyPress);
  }

  render() {
    const answer = this.state.buzzed ? ( <input onChange={(event) => {this.setState({answer: event.target.value});}} id={"answer"}/> ) : null; //probably move to another component
    return (
      <div>
        Room :)
        <button onClick={() => {this.socket.emit("startGame")}}>start game</button>
        { answer }
        <div className={"question-container"}>{ this.state.question }</div>
      </div>
    );
  }
}

export default Game;