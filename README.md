# Short Link Server

A Cloudflare Worker-based short link service with D1 database storage.

## Features

- Generate short links for URLs
- Store and display text content
- Frontend for creating and viewing links
- Admin dashboard with authentication
- Data persistence using Cloudflare D1 database
- Responsive design for all devices

## How It Works

1. Users can create short links by submitting URLs or text content through the main page
2. For URLs, the service generates a short link that redirects to the original URL
3. For text content, the service displays the text directly when the short link is accessed
4. Users can view their created links on the main page
5. Admins can access a dashboard to manage all links with authentication

## Project Structure

```
.
├── src/
│   └── index.js        # Main Worker entry point
├── schema.sql          # D1 database schema
├── wrangler.toml       # Wrangler configuration
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a D1 database:
   ```bash
   wrangler d1 create shortlink_db
   ```

3. Update the `wrangler.toml` file with your database ID.

4. Apply the database schema:
   ```bash
   npm run d1:migrate
   ```

5. Run locally for development:
   ```bash
   npm run dev
   ```

6. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

## API Endpoints

- `GET /` - Main page for creating short links
- `POST /api/shorten` - Create a new short link
- `GET /:slug` - Redirect to the target URL or display text content
- `GET /admin` - Admin login page
- `POST /admin/api/login` - Admin authentication
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/api/links` - Get all links (admin API)
- `DELETE /admin/api/links/:id` - Delete a link (admin API)

## Authentication

The admin dashboard is protected with a simple password authentication. The default password is `admin` - you should change this in production.

## Database Schema

The service uses a single table `links` with the following columns:

- `id` - Auto-incrementing primary key
- `slug` - Unique short link identifier
- `target` - Original URL or text content
- `is_text` - Boolean indicating if the target is text content
- `created_at` - Creation timestamp
- `clicks` - Number of times the link has been accessed

## Customization

You can customize the service by modifying the `src/index.js` file:

- Change the slug generation algorithm
- Modify the frontend design
- Enhance the authentication system
- Add analytics or additional features