.PHONY: deploy

deploy:
	git pull origin main
	pnpm build
	pm2 restart pm2.config.js

pgen:
	npx prisma generate

ppush:
	npx prisma db push

ppushf:
	npx prisma db push --force-reset

pstudio:
	npx prisma studio