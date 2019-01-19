import React from "react";
import "../css/app.css";
import Route from "react-router-dom/es/Route";
import Switch from "react-router-dom/es/Switch"
import PacketSelection from "./PacketSelection"
import Game from "./game/Game";

class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/room/:roomid" component={Game} />
          <Route exact path="/" component={PacketSelection} />
        </Switch>
      </div>
    )
    ;
  }
}

export default App;