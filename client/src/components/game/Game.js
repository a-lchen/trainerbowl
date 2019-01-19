import React from "react";
import io from "socket.io-client";

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.socket = io("http://localhost:3000");
    this.socket.emit("joinRoom", {roomID: this.props.match.params.roomID});
    this.state = {

    }
  }

  componentDidMount() {
    this.socket.on("gameUpdate", update => {
      console.log(update)
    })
  }

  render() {
    return (
      <div>
        Room :)
        <button onClick={() => {this.socket.emit("startGame")}}>start game</button>
        <button onClick={() => {this.socket.emit("nextQuestion")}}>start question</button>
      </div>
    );
  }
}

export default Game;