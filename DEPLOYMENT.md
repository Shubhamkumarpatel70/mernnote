# Notes App - Render Deployment Guide

## Deploy to Render

This app is configured to deploy both frontend and backend together on Render.

### Steps:

1. **Push to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Render Account:**

   - Go to https://render.com and sign up

3. **Deploy:**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Or manually configure:
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Environment:** `Node`

4. **Add Environment Variables in Render Dashboard:**

   - `NODE_ENV` = `production`
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Your secret key
   - `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` = Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` = Your Cloudinary API secret
   - `EMAIL_USER` = Your email (optional)
   - `EMAIL_PASS` = Your email password (optional)
   - `HF_TOKEN` = Your Hugging Face token (optional)

5. **MongoDB Atlas Setup (Required):**
   - Create free cluster at https://www.mongodb.com/cloud/atlas
   - Get connection string
   - Add to `MONGO_URI` in Render

### Your app will be live at: `https://your-app-name.onrender.com`

## Local Development

- Backend: `npm start` (port 1000)
- Frontend: `cd frontend && npm run dev` (port 5173)
