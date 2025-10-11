#!/bin/bash

echo "🚀 Starting Warrior Jews with ngrok..."
echo ""

# Start ngrok in the background and capture its URL
ngrok http 9002 --log=stdout > /tmp/ngrok.log &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to start..."
sleep 3

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[a-z0-9-]*\.ngrok-free\.app' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Make sure ngrok is running."
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok tunnel created: $NGROK_URL"
echo ""
echo "📝 Update your Google OAuth settings with:"
echo "   Authorized redirect URI: $NGROK_URL/api/google/oauth/callback"
echo "   Authorized JavaScript origin: $NGROK_URL"
echo ""
echo "🔧 Temporarily updating .env with ngrok URL..."

# Backup and update .env
cp .env .env.ngrok.backup
sed -i "s|NEXT_PUBLIC_URL=.*|NEXT_PUBLIC_URL=$NGROK_URL|g" .env
sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=$NGROK_URL/api/google/oauth/callback|g" .env

echo "✅ .env updated (backup saved as .env.ngrok.backup)"
echo ""
echo "🌐 Your app will be available at: $NGROK_URL"
echo "🌐 Ngrok dashboard: http://localhost:4040"
echo ""
echo "Starting Next.js dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Next.js
npm run dev

# Cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $NGROK_PID 2>/dev/null
    echo "♻️  Restoring original .env..."
    mv .env.ngrok.backup .env 2>/dev/null
    echo "✅ Cleanup complete"
}

trap cleanup EXIT

