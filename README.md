# The valley

## run dev
- api port 3001
- web port 3000
```
pnpm run dev
```

## add package project
- pnpm add -filter [project-name] [package-name]

```
pnpm add -filter api dayjs
```

## Deploy
- .env change url server
- run bash install script
  ```
  bash ./script/install.sh
  ```
- copy nginx
  ```
  cp ../nginx/default.conf:/etc/nginx/conf.d/default.conf
  ```
- config upload nginx
  ```
    http {
    ...
    client_max_body_size 100M;
    ...
    server {
      ...
    }
    }
  ```
- run pm2
- restart nginx


## Cli

- make install => install libs for run server
- make run => run services
- make restart => restart services
- make update => update code & build restart
