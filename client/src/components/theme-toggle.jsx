import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isLight = theme === "light";
  const Icon = isLight ? Sun : Moon;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      title={`Switch to ${isLight ? "dark" : "light"} theme`}
      className="group relative overflow-hidden"
    >
      <Icon
        key={theme}
        className="h-4 w-4 transition-all duration-300 ease-out group-hover:rotate-12 group-hover:scale-110"
      />
    </Button>
  );
}

export default ThemeToggle;
