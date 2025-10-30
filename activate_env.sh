#!/bin/bash
# Script to activate the virtual environment for HamaroGharaStore

echo "Activating virtual environment for HamaroGharaStore..."
cd /Users/homepc/Desktop/HamaroGharaStore
source venv/bin/activate
echo "Virtual environment activated!"
echo "You can now run Django commands like:"
echo "  python manage.py runserver"
echo "  python manage.py migrate"
echo "  python manage.py createsuperuser"
echo ""
echo "To deactivate, simply type: deactivate"
