/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--vscode-button-background, #0078D4)',
          hover: 'var(--vscode-button-hoverBackground, #026EC1)',
          foreground: 'var(--vscode-button-foreground, #FFFFFF)'
        },
        secondary: {
          DEFAULT: 'var(--vscode-button-secondaryBackground, #313131)',
          hover: 'var(--vscode-button-secondaryHoverBackground, #3C3C3C)',
          foreground: 'var(--vscode-button-secondaryForeground, #CCCCCC)'
        },
        background: {
          DEFAULT: 'var(--vscode-editor-background, #1F1F1F)',
          sidebar: 'var(--vscode-sideBar-background, #181818)',
          input: 'var(--vscode-input-background, #313131)'
        },
        foreground: {
          DEFAULT: 'var(--vscode-foreground, #CCCCCC)',
          secondary: 'var(--vscode-descriptionForeground, #9D9D9D)'
        },
        border: {
          DEFAULT: 'var(--vscode-input-border, #3C3C3C)',
          focus: 'var(--vscode-focusBorder, #0078D4)'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};