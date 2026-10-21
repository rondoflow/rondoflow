{
  "*.{ts,tsx,js,jsx,json,md}": [
    "prettier --write"
  ],
  "*.ts?(x)": () => "npx --no -- tsc --noEmit"
}
