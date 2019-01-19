import React from "react";
import io from "socket.io-client";

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.socket = io("http://localhost:3000");
    this.socket.emit("joinRoom", this.props.match.params.roomid);
  }

  render() {
    return (
      <div>
        Room :)
      </div>
    );
  }
}

export default Game;