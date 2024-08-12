from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class Customer(AbstractUser):
    GENDERS = (
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    )
    gender = models.CharField(max_length=10, choices=GENDERS, null=True, blank=True)
    mobile_number = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.email


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
    
    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class Dish(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='images/', default='default_dish_image.jpg')
    price = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='dishes')

    class Meta:
        verbose_name = 'Dish'
        verbose_name_plural = 'Dishes'
        ordering = ('-price',)

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("cancelled", "Cancelled"),
        ("delivered", "Delivered"),
    ]

    ORDER_TYPE_CHOICES = [
        ("takeaway", "Takeaway"),
        ("dining", "Dining"),
        ("delivery", "Delivery"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("card", "Card"),
    ]

    customer = models.ForeignKey(Customer, related_name='orders', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bill_generated = models.BooleanField(default=False)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='dining')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.id} - {self.created_at} - {self.order_type}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.order.id} - {self.dish} - {self.quantity}"


class Bill(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='bills')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='bills')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)
    billed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-billed_at',)

    def __str__(self):
        return f"Bill for order {self.order.id}"
    
    def save(self, *args, **kwargs):
        if not self.pk:
            self.customer = self.order.customer
            self.order.bill_generated = True
            self.paid = True
            self.order.save()
        super().save(*args, **kwargs)


class Notification(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.message[:50]}..."
    

@receiver(post_save, sender=Order)
def create_notification_for_orders(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            message=f"New order created: Order #{instance.id} with a total amount of ${instance.total_amount}"
        )


@receiver(post_save, sender=Bill)
def create_notification_for_bills(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            message=f"New bill #{instance.id} generated for Order #{instance.order.id}"
        )



class Floor(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Table(models.Model):
    table_name = models.CharField(max_length=50)
    start_time = models.TimeField(default='00:00')
    end_time = models.TimeField(default='00:00')
    seats_count = models.PositiveIntegerField()
    capacity = models.PositiveIntegerField()
    floor = models.ForeignKey(Floor, related_name='tables', on_delete=models.CASCADE)
    is_ready = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.table_name} - {self.floor.name}"
    

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)  
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2) 
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  
    start_date = models.DateTimeField(default=timezone.now) 
    end_date = models.DateTimeField()  
    is_active = models.BooleanField(default=True)  
    usage_limit = models.PositiveIntegerField(null=True, blank=True)  
    usage_count = models.PositiveIntegerField(default=0)  
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  
    description = models.TextField(null=True, blank=True)  

    def __str__(self):
        return self.code

    def is_valid(self):
        """Check if the coupon is valid based on its date and usage limit."""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.start_date > now or self.end_date < now:
            return False
        if self.usage_limit is not None and self.usage_count >= self.usage_limit:
            return False
        return True

    def apply_discount(self, amount):
        """Apply the discount to a given amount."""
        if self.discount_percentage:
            return amount - (amount * self.discount_percentage / 100)
        if self.discount_amount:
            return amount - self.discount_amount
        return amount

