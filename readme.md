# The Valley

## run dev
- api port 3000
- web port 8080
```
pnpm run dev
```

## add package project
- pnpm add -filter [project-name] [package-name]

```
pnpm add -filter api dayjs
```

## Deploy
- install standard
  ```
  make install
  ```
- .env change url server
- copy .env to apps web & api
- run apps
  ```
  make run
  ```
