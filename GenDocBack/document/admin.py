from django.contrib import admin
from document.models import Document


# Register your models here.
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        'uuid',
        'user',
        'template_version',
        'status',
        'created_at',
        'completed_at',
    )
    list_filter = (
        'status',
        'created_at',
        'completed_at',
    )
    search_fields = ('uuid', 'user__username')
    readonly_fields = ('uuid', 'created_at', 'completed_at')
    fieldsets = (
        ('Informations générales', {
            'fields': ('uuid', 'user', 'template_version', 'status')
        }),
        ('Données', {
            'fields': ('input_data', 'output_file', 'error_log')
        }),
        ('Dates', {
            'fields': ('created_at', 'completed_at')
        }),
    )