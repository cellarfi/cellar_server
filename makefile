.PHONY: deploy

deploy:
	git pull origin main
	pnpm build
	pm2 restart pm2.config.js

pgen:
	npx prisma generate

ppush:
	npx prisma db push

pstudio:
	npx prisma studio