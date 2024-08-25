from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from restaurant_app.models import *


class CustomAdminSite(AdminSite):
    site_header = "Nasscript"
    site_title = "Nasscript"
    index_title = "Welcome to Nasscript Admin Panel"

    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        excluded_apps = ['token_blacklist', 'auth']
        return [app for app in app_list if app['app_label'] not in excluded_apps]


admin_site = CustomAdminSite()

admin_site.site_header = "Nasscript"
admin_site.site_title = "Nasscript"
admin_site.index_title = "Welcome to Nasscript Admin Panel"


admin_site.register(User)
admin_site.register(Category)
admin_site.register(Dish)
admin_site.register(Order)
admin_site.register(OrderItem)
admin_site.register(Bill)
admin_site.register(Notification)
admin_site.register(Floor)
admin_site.register(Table)
admin_site.register(Coupon)

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "day_of_week",
        "sub_total",
        "is_custom",
        "mess_type",
        "created_by",
    )
    list_filter = ("day_of_week", "is_custom", "mess_type", "created_by")
    fields = (
        "name",
        "day_of_week",
        "sub_total",
        "is_custom",
        "mess_type",
        "created_by",
    )
    search_fields = ("name", "day_of_week", "mess_type__name", "created_by")

admin_site.register(MenuItem)
admin_site.register(Mess)
admin_site.register(MessType)

admin_site.register(CreditUser)
admin_site.register(CreditOrder)
