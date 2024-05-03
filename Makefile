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
