# The valley

- Bootstrap Nextjs and Nestjs

### Prerequisites

- [Node](https://nodejs.org/en/download/)
- [Pnpm](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Stack Information

| Concern          | Solution                                  |
| ---------------- | ----------------------------------------- |
| Server           | [Node](https://nodejs.org/)               |
| Server Framework | [Nest.js](https://nestjs.com/)            |
| Database         | [PostgreSQL](https://www.postgresql.org/) |
| UI Framework     | [Next.js](https://nextjs.org/)            |
| Styling          | [Tailwindcss](https://tailwindcss.com//)  |

### Installation

```bash
$ git clone https://github.com/dukerspace/valley
$ cd valley
$ cp .env.example .env # Add your own vars here
$ pnpm i
$ pnpm run dev
```

- By default, the app will run at ui: http://localhost:3000/
- By default, the app will run at api http://localhost:3001/

### Development

- [Dev](./docs/dev.md)
-

### Deploy

- script deploy instance [Nimman](https://github.com/dukerspace/nimman/)
