

Steps on Running The app in local

1. Make sure the docker is running then navigate to app directory cd to construction_project
2. run -> docker-compose up -d -> for starting the postgres server, redis and minio
3. navigate to app folder -> cd to construction_project
4. run -> npx drizzle-kit generate 
5. run -> npx drizzle-kit migrate or npx drizzle-kit push 
6. run -> npx tsx db/seed.ts ->perform seeding data to database adding
7. run -> npm run dev -> this will start the next.js app