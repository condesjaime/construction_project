

Steps on Running The app in local

Configuration:
///////////////////
create a file .env and paste this string: DATABASE_URL=postgresql://admin:password123@localhost:5432/construction_scheduling

///////////////////
create another file .env.local and paste these constants: 
# Database Configuration
DATABASE_URL=postgresql://admin:password123@localhost:5432/construction_scheduling

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development

NEXT_PUBLIC_S3_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_S3_PUBLIC_URL=http://localhost:9000
NEXT_PUBLIC_S3_BUCKET=uploads
NEXT_PUBLIC_S3_ACCESS_KEY=admin
NEXT_PUBLIC_S3_SECRET_KEY=password123
NEXT_PUBLIC_S3_REGION=us-east-1

////////////
run npm install
npm install @aws-sdk/client-s3


1. Make sure the docker is running then navigate to app directory cd to construction_project
2. run -> docker-compose up -d -> for starting the postgres server, redis and minio
3. open a browser for minio server http://localhost:9001 and create a   bucket "uploads" use the credentials above for user and password
run: docker exec -it minio mc alias set local http://localhost:9000 admin password123 

make the uploads bucket public run: docker exec -it minio mc anonymous set public local/uploads

4. navigate to app folder -> cd to construction_project
5. run -> npx drizzle-kit generate 
6. run -> npx drizzle-kit migrate or npx drizzle-kit push 
7. run -> npx tsx db/seed.ts ->perform seeding data to database adding
8. run -> npm run dev -> this will start the next.js app

create your own account using create account - this is to make sure there will be a user that who created the diary should be log.