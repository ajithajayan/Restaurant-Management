from restaurant_app.admin import admin_site
from .models import DeliveryDriver, DeliveryOrder

admin_site.register(DeliveryDriver)
admin_site.register(DeliveryOrder)
