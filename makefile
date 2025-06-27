.PHONY: deploy

deploy:
	git pull origin main
	pnpm build
	pm2 restart pm2.config.js
