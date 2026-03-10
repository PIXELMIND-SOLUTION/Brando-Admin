import { createContext, useContext } from "react";

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const theme = {
  bg:         "bg-[#ff6b6b]",
  bgHover:    "hover:bg-[#ff5252]",
  bgDark:     "bg-[#ff4d4d]",
  text:       "text-[#ff6b6b]",
  border:     "border-[#ff6b6b]",
  ring:       "ring-[#ff6b6b]",
  shadow:     "shadow-[0_4px_24px_rgba(255,107,107,0.25)]",
  shadowLg:   "shadow-[0_8px_40px_rgba(255,107,107,0.30)]",
  accent:     "bg-[#ff8787]",
};

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme }}>
    {children}
  </ThemeContext.Provider>
);