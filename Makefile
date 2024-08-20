.PHONY: compose
compose:
	docker compose up -d --build

.PHONY: install
install:
	bash ./scripts/install.sh

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
	cd apps/api && npx prisma migrate dev

.PHONY: db-pull
db-pull:
	cd apps/api && npx prisma db pull
.PHONY: db-gen
db-gen:
	cd apps/api && npx prisma generate
