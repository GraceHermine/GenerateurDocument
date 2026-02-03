from django.contrib import admin
from .models import Category, Template, TemplateVersion


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'created_at')
    list_filter = ('parent', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)


class TemplateVersionInline(admin.TabularInline):
    model = TemplateVersion
    extra = 0
    fields = ('version_number', 'is_active', 'change_log', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-version_number',)


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'engine', 'is_active', 'created_at')
    list_filter = ('engine', 'is_active', 'category', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('uuid', 'created_at', 'updated_at')
    inlines = [TemplateVersionInline]
    fieldsets = (
        ('Informations générales', {
            'fields': ('uuid', 'title', 'category', 'description')
        }),
        ('Configuration', {
            'fields': ('engine', 'is_active')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(TemplateVersion)
class TemplateVersionAdmin(admin.ModelAdmin):
    list_display = ('template', 'version_number', 'is_active', 'created_at')
    list_filter = ('is_active', 'template', 'created_at')
    search_fields = ('template__title', 'change_log')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informations', {
            'fields': ('template', 'version_number', 'is_active', 'change_log')
        }),
        ('Fichiers', {
            'fields': ('source_file', 'preview_image')
        }),
        ('Schéma', {
            'fields': ('input_schema',),
            'description': 'Définition JSON du formulaire'
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

