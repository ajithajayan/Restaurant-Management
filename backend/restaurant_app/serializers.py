from rest_framework import serializers
from django.contrib.auth import get_user_model
from restaurant_app.models import *


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'mobile_number', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class DishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'description', 'price', 'image', 'category',]


class OrderItemSerializer(serializers.ModelSerializer):
    dish = serializers.PrimaryKeyRelatedField(queryset=Dish.objects.all())

    class Meta:
        model = OrderItem
        fields = ['dish', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'created_at', 'total_amount', 'status', 'bill_generated', 'items','order_type','payment_method']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user
        order = Order.objects.create(customer=customer, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order


class BillSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Bill
        fields = ['id', 'order', 'customer', 'total_amount', 'paid', 'billed_at']


class NotificationSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'customer', 'message', 'created_at', 'is_read']


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = ['name']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'discount_amount',
            'discount_percentage',
            'start_date',
            'end_date',
            'is_active',
            'usage_limit',
            'usage_count',
            'min_purchase_amount',
            'description'
        ]
        read_only_fields = ['usage_count'] 