.PHONY: compose
compose:
	docker compose up -d --build

.PHONY: install
install:
	bash ./install.sh

.PHONY: run
run:
	bash ./run.sh
