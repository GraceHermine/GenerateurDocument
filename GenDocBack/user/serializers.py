from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=75)
    last_name = serializers.CharField(max_length=75)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe deja.")
        return value

    def create(self, validated_data):
        first_name = validated_data["first_name"].strip()
        last_name = validated_data["last_name"].strip()
        email = validated_data["email"].lower().strip()
        password = validated_data["password"]

        user = User.objects.create_user(
            email=email,
            password=password,
            nom=last_name,
            prenom=first_name
        )

        return user


class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "nom",
            "prenom",
            "is_staff",
            "is_superuser"
        ]
        read_only_fields = fields
