import { Navigate } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import { Component } from "react";
import socketIOClient from "socket.io-client";
import toastr from "toastr";

import Board from "./Board";
import { Box } from "@mui/system";

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      authenticated: false,
      loggingOut: false,
      user: null,
      lobby: null,
      board: new Array(9).fill(null),
      opponent: null,
      canMove: false,
      connected: false,
    };
  }

  async handleLogout() {
    return fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(async (response) => {
      if (response.status === 200) {
        toastr.success("Logged out successfully");
        this.setState({ authenticated: false });
      } else {
        toastr.error(await response.text());
      }
    });
  }
  async handleCreateGame() {
    return fetch("/api/lobby/newGame").then(async (response) => {
      if (response.status === 200) {
        toastr.success("Game created successfully");
        this.setState({
          lobby: await response.json().then((data) => data.gameId),
        });
      } else {
        toastr.error(await response.text());
      }
    });
  }
  async handleJoinGame() {
    return fetch("/api/lobby/joinGame").then(async (response) => {
      if (response.status === 200) {
        const data = await response.json();
        if (!data.gameId) {
          return toastr.error("No games available");
        } else {
          toastr.success("Game joined successfully");
          this.setState({
            lobby: data.gameId,
            opponent: data.opponent,
            canMove: true,
          });
        }
      } else {
        toastr.error(await response.text());
      }
    });
  }
  componentDidMount() {
    if (!this.state.authenticated) {
      fetch("/api/user").then(async (response) => {
        if (response.status === 200) {
          this.setState({ user: await response.json() });
          this.setState({ authenticated: true });
        } else {
          this.setState({ authenticated: false });
        }
        this.setState({ loading: false });
      });
    }
  }
  componentDidUpdate() {
    if (this.state.authenticated && !this.state.connected) {
      const socket = socketIOClient({
        path: "/api/socket",
      });
      socket.on("move", (data) => {
        const { playerId, newBoard, canMove, opponent } = JSON.parse(data);
        if (playerId !== this.state.user?.id) {
          this.setState({ board: newBoard, canMove, opponent });
        }
      });
      this.setState({ connected: true });
    }
  }
  render() {
    return (
      <div>
        {this.state.loading ? (
          <Box>
            <CircularProgress />
          </Box>
        ) : this.state.authenticated ? (
          <>
            <div className="game">
              <Board
                gameId={this.state.lobby}
                board={this.state.board}
                canMove={this.state.canMove}
                opponent={this.state.opponent}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                position: "absolute",
                top: "2rem",
                right: "2rem",
              }}
            >
              <Button
                variant="contained"
                color="error"
                onClick={() => this.handleLogout()}
              >
                Logout
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => this.handleCreateGame()}
              >
                Create Game
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => this.handleJoinGame()}
              >
                Join Game
              </Button>
            </div>
          </>
        ) : (
          <Navigate to="/" />
        )}
      </div>
    );
  }
}

export default Game;
