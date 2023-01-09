import { Navigate } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import { Component } from "react";
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
  componentDidMount() {
    if (!this.state.authenticated) {
      fetch("/api/user").then(async (response) => {
        if (response.status === 200) {
          this.setState({ authenticated: true });
        } else {
          this.setState({ authenticated: false });
        }
        this.setState({ loading: false });
      });
    }
  }
  render() {
    return (
      <>
        <div>
          {this.state.loading ? (
            <Box>
              <CircularProgress />
            </Box>
          ) : this.state.authenticated ? (
            <>
              <div className="game">
                <Board />
              </div>
              <div style={{ position: "absolute", top: "2rem", right: "2rem" }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => this.handleLogout()}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Navigate to="/" />
          )}
        </div>
      </>
    );
  }
}

export default Game;
