import toastr from "toastr";

export default function Board({ board: squares, canMove, gameId, opponent }) {
  const Square = ({ value, onClick }) => {
    return (
      <div className="board-cell" onClick={onClick}>
        {value}
      </div>
    );
  };

  const handleClick = async (i) => {
    await fetch("/api/lobby/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        position: i,
        gameId,
      }),
    }).then(async (response) => {
      const data = await response.json();
      if (data.success) {
        toastr.success("Move made successfully");
      } else {
        toastr.error("Something went wrong");
      }
    });
  };

  const renderSquare = (i) => {
    return <Square value={squares[i]} onClick={() => handleClick(i)} />;
  };

  const calculateWinner = (squares) => {
    for (let i = 0; i < 3; i++) {
      if (
        squares[i] &&
        squares[i] === squares[i + 3] &&
        squares[i] === squares[i + 6]
      ) {
        return squares[i];
      }
    }
    for (let i = 0; i < 9; i += 3) {
      if (
        squares[i] &&
        squares[i] === squares[i + 1] &&
        squares[i] === squares[i + 2]
      ) {
        return squares[i];
      }
    }
    if (squares[0] && squares[0] === squares[4] && squares[0] === squares[8]) {
      return squares[0];
    }
    if (squares[2] && squares[2] === squares[4] && squares[2] === squares[6]) {
      return squares[2];
    }
    return null;
  };
  const isDraw = (squares) => {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        return false;
      }
    }
    return true;
  };

  return (
    <div>
      <div className="status">
        {/* {calculateWinner(squares) ? (
          <div>Winner: {calculateWinner(squares)}</div>
        ) : isDraw(squares) ? (
          <div>Draw</div>
        ) : ( */}
        <div>Next player: {canMove ? "You" : opponent}</div>
        {/* )} */}
      </div>
      <div className="board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
    </div>
  );
}
