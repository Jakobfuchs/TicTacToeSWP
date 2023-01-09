import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Authentication from "./components/Authentication";
import Game from "./components/Game";

const theme = createTheme({
  palette: {
    primary: {
      light: "#ffffff",
      main: "#ffffff",
      dark: "#ffffff",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ffffff",
      main: "#ffffff",
      dark: "#ffffff",
      contrastText: "#ffffff",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div className="body">
          <Router>
            <Routes>
              <Route path="/" exact element={<Authentication />}></Route>
              <Route path="/game" exact element={<Game />}></Route>
              <Route path="/*" element={<Navigate to="/" />}></Route>
            </Routes>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
