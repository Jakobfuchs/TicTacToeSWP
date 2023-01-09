import {
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Component } from "react";
import { Navigate } from "react-router-dom";
import toastr from "toastr";

export default class Authentication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      mode: "login",
      redirectToGame: false,
      authenticated: false,
      loading: true,
    };
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

  async handleLogin() {
    return fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      }),
    }).then(async (response) => {
      if (response.status === 200) {
        toastr.success("Logged in successfully");
        this.setState({ redirectToGame: true });
      } else {
        toastr.error(await response.text());
      }
    });
  }
  async handleRegister() {
    if (this.state.password !== this.state.confirmPassword) {
      toastr.error("Passwords do not match");
    }

    return fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      }),
    }).then(async (response) => {
      if (response.status === 200) {
        toastr.success("Registered successfully");
        this.setState({ redirectToGame: true });
      } else {
        toastr.error(await response.text());
      }
    });
  }

  render() {
    return (
      <>
        {this.state.redirectToGame && <Navigate to="/game" />}
        {!this.state.loading && this.state.authenticated && (
          <Navigate to="/game" />
        )}
        {this.state.loading ? (
          <Box>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            style={{
              border: "1px solid white",
              padding: "2rem",
              borderRadius: "10px",
            }}
          >
            <Typography variant="h4" component="h1">
              Tic Tac Toe
            </Typography>
            <Tabs
              value={this.state.mode}
              onChange={(e, value) => this.setState({ mode: value })}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Login" value={"login"} />
              <Tab label="Register" value={"register"} />
            </Tabs>
            <form
              style={{ color: "white" }}
              onSubmit={(e) => {
                e.preventDefault();

                if (this.state.mode === "login") {
                  this.handleLogin();
                } else {
                  this.handleRegister();
                }
              }}
            >
              <TextField
                label="Email"
                value={this.state.email}
                variant="outlined"
                onChange={(e) => this.setState({ email: e.target.value })}
              />
              <TextField
                label="Password"
                value={this.state.password}
                type="password"
                onChange={(e) => this.setState({ password: e.target.value })}
              />
              {this.state.mode === "register" && (
                <TextField
                  label="Confirm Password"
                  value={this.state.confirmPassword}
                  type="password"
                  onChange={(e) =>
                    this.setState({ confirmPassword: e.target.value })
                  }
                />
              )}
              <Button type="submit" variant="outlined">
                {this.state.mode === "login" ? "Login" : "Register"}
              </Button>
            </form>
          </Box>
        )}
      </>
    );
  }
}
