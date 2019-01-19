import React from "react";
import Link from "react-router-dom/es/Link";

class PacketSelection extends React.Component {
  render() {
    return (
      <div>
        <Link to='/room/1'>Go To Room</Link>
      </div>
    )
    ;
  }
}

export default PacketSelection;