import { Moon, Sun } from "lucide-react"
import { Button } from "@/Components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}