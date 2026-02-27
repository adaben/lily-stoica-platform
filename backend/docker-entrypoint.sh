#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Seeding data..."
python manage.py seed_data || echo "Seed skipped or already done."

echo "Starting Gunicorn..."
exec gunicorn lily_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --worker-class gthread \
    --threads 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
