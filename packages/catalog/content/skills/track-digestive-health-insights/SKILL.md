---
name: track-digestive-health-insights
description: "GutCheck - A digestive health tracking application with personalized insights and data-driven recommendations. Helps users understand food sensitivities and optimize gut wellness."
category: "Data & Analytics"
author: community
version: "1.0.0"
icon: chart-bar
---

# GutCheck Digestive Health Tracker

## Overview
GutCheck empowers individuals to understand and optimize their digestive health through personalized insights and data-driven recommendations. Unlike generic health apps, GutCheck focuses specifically on digestive health with scientifically-backed insights that help users identify food sensitivities and improve gut wellness.

## Features
- User authentication system with secure registration and login
- Personalized meal tracking with digestive impact assessment
- Food sensitivity identification through data analysis
- Gut health metrics and progress tracking
- Scientifically-backed dietary recommendations

## Installation
```bash
clawhub install gutcheck
```

## Setup
1. After installation, navigate to the gutcheck directory
2. Create a .env file with required environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gutcheck
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```
3. Run the application:
   ```bash
   cd gutcheck
   npm run dev
   ```

## Usage
- Access the application at http://localhost:3000
- Register a new account or log in to an existing one
- Track your meals and digestive responses
- View personalized insights and recommendations

## Target Users
- Health-conscious individuals experiencing digestive issues
- People seeking to identify food sensitivities
- Those interested in optimizing their gut health
- Users wanting data-driven dietary recommendations

## API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and retrieve JWT token
- `GET /api/auth/me` - Get current user data (requires auth)
- `POST /api/diet/add-meal` - Add a new meal entry
- `GET /api/diet/my-meals` - Get all meals for current user
- `PUT/DELETE /api/diet/my-meals/:id` - Update/delete meal entries
