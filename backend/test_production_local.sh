#!/usr/bin/env bash
# Local deployment testing script
# Tests if the backend can run in production-like mode locally

echo "================================"
echo "PELEC Project - Local Deploy Test"
echo "================================"
echo ""

# Navigate to backend
cd backend || exit

echo "1️⃣  Testing with production settings..."
echo ""

# Generate a test SECRET_KEY
export SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
export DEBUG=False
export ALLOWED_HOSTS=localhost,127.0.0.1
export FRONTEND_URLS=http://localhost:3000

echo "✓ Environment variables set:"
echo "  - DEBUG=False"
echo "  - SECRET_KEY=<generated>"
echo "  - ALLOWED_HOSTS=localhost,127.0.0.1"
echo ""

echo "2️⃣  Running database migrations..."
python manage.py migrate --noinput
if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi
echo "✓ Migrations successful"
echo ""

echo "3️⃣  Collecting static files..."
python manage.py collectstatic --noinput
if [ $? -ne 0 ]; then
    echo "❌ Static file collection failed!"
    exit 1
fi
echo "✓ Static files collected"
echo ""

echo "4️⃣  Testing with DEBUG=False..."
echo "⚠️  Starting server with DEBUG=False (CTRL+C to stop)"
echo ""
python manage.py runserver 0.0.0.0:8000
