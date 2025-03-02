.PHONY: run
run:
	bash ./scripts/run.sh

.PHONY: update
update:
	bash ./scripts/update.sh

.PHONY: restart
restart:
	bash ./scripts/restart.sh

.PHONY: migrate
migrate:
	bash ./scripts/migrate.sh

.PHONY: db-pull
db-pull:
	cd apps/api && npx prisma db pull

.PHONY: db-gen
db-gen:
	cd apps/api && npx prisma generate

# make gen type=controller name=user
.PHONY: gen
gen:
	cd apps/api && npx @nestjs/cli g $(type) $(name)

.PHONY: api-build
api-build:
	cd apps/api && pnpm run build

.PHONY: api-dev
api-dev:
	cd apps/api && pnpm run dev
