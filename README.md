# Build Environnement
python3.11 is require 
```bash
pyenv local 3.11
```
```bash
python -m venv .env
pip install -r requirements.txt
```

# Run NextJS server
```bash
npm install
npm run dev
```
or
```bash
pnpm i
pnpm dev
```
or
```bash
yarn install
yarn run dev
```


# Run fatsapi serveur
```bash
uvicorn main:app --reload
```

