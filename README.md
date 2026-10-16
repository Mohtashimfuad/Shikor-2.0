# Shikor (শিকড়)

Digital land-loss evidence platform for river-erosion-affected families in Bangladesh.
Built for the DIU CSE-TECH Landtech Hackathon (Team LA-23, Land Records track).

## The problem
River erosion in char areas submerges land every year. Families lose their land
but have no verifiable proof of loss or past possession, which blocks claims
for khas land allocation.

## What Shikor does
- Citizens file an erosion claim with Khatian/Dag details and geotagged photo evidence
- Community witnesses attest to possession
- Satellite water-index (Sentinel-2 NDWI) check supports the claim
- A Land Loss Certificate with QR code and SHA-256 hash is generated for AC Land / UNO review

## Tech stack
React, TypeScript, Vite, Tailwind CSS, Leaflet, Supabase (PostgreSQL, PostGIS, Storage)

## Run locally
Prerequisite: Node.js

1. `npm install`
2. `npm run dev`
3. Open the app, click the Supabase button, and enter your Project URL and anon key
4. Run `supabase_schema.sql` in the Supabase SQL Editor

## Team
Team LA-23
