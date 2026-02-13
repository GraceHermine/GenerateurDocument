from rest_framework import serializers
import re

class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=100)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)

class OrderCreateSerializer(serializers.Serializer):
    """
    Exemple de schéma de validation robuste pour une commande (Order).
    Prévient les injections via une validation stricte des types et des regex.
    """
    customer_name = serializers.CharField(max_length=100, min_length=2)
    shipping_address = serializers.CharField(max_length=255)
    postal_code = serializers.CharField(max_length=10)
    items = OrderItemSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_customer_name(self, value):
        # Prévention d'injections de scripts ou caractères spéciaux dangereux
        if not re.match(r"^[a-zA-ZÀ-ÿ\s'-]+$", value):
            raise serializers.ValidationError("Le nom contient des caractères non autorisés.")
        return value

    def validate_postal_code(self, value):
        # Validation stricte du format (ex: France)
        if not re.match(r"^\d{5}$", value):
            raise serializers.ValidationError("Code postal invalide (5 chiffres attendus).")
        return value

    def validate(self, data):
        # Validation logique métier : vérification du total
        calculated_total = sum(item['price'] * item['quantity'] for item in data['items'])
        if abs(calculated_total - data['total_amount']) > 0.01:
            raise serializers.ValidationError({"total_amount": "Le montant total ne correspond pas à la somme des articles."})
        
        return data
