.PHONY: install dev run-backend infra

install:
	cd frontend && yarn install
	cd backend && poetry install

dev:
	# To run backend, use 'make run-backend'
	cd frontend && yarn dev

run-backend:
	cd backend && poetry run python main.py

infra:
	cd terraform && terraform apply
