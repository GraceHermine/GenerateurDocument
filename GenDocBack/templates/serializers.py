from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Category, Template, TemplateVersion


class CategorySerializer(serializers.ModelSerializer):
    """Sérialiseur pour les catégories de templates."""
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'subcategories_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_subcategories_count(self, obj):
        return obj.subcategories.count()


class TemplateVersionSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les versions de templates."""
    source_file_url = serializers.SerializerMethodField()
    preview_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TemplateVersion
        fields = [
            'id', 'template', 'version_number', 'source_file', 'source_file_url',
            'input_schema', 'preview_image', 'preview_image_url', 'is_active',
            'change_log', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_source_file_url(self, obj):
        if obj.source_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.source_file.url)
        return None
    
    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_preview_image_url(self, obj):
        if obj.preview_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_image.url)
        return None


class TemplateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les templates."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    current_version = TemplateVersionSerializer(read_only=True)
    versions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Template
        fields = [
            'id', 'uuid', 'title', 'category', 'category_name', 'description',
            'engine', 'is_active', 'current_version', 'versions_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']
    
    @extend_schema_field(serializers.IntegerField)
    def get_versions_count(self, obj):
        return obj.versions.count()


class TemplateListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des templates."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    current_version_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Template
        fields = [
            'id', 'uuid', 'title', 'category_name', 'description',
            'engine', 'is_active', 'current_version_number', 'created_at'
        ]
        read_only_fields = ['uuid', 'created_at']
    @extend_schema_field(serializers.IntegerField(allow_null=True))
    
    def get_current_version_number(self, obj):
        version = obj.current_version
        return version.version_number if version else None
