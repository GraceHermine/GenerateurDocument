"""
URL configuration for GenDocBack project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.admin import GroupAdmin

from admin_custom.admin_site import custom_admin_site
from admin_custom.autodiscover import autodiscover_models
from admin_custom.user_admin import CustomUserAdmin
from admin_custom.modern_model_admin import ModernTemplateMixin
from admin_custom.models import DashboardGrid, DashboardChart
from admin_custom.admin import DashboardGridAdmin, DashboardChartAdmin

User = get_user_model()

# ─── 1. Auto-decouvrir tous les modeles du projet ───
autodiscover_models(custom_admin_site, exclude_apps=['admin_custom'])

# ─── 2. Enregistrer les modeles auth manuellement ───
for model in [User, Group, Permission]:
    if model in custom_admin_site._registry:
        custom_admin_site.unregister(model)

custom_admin_site.register(User, CustomUserAdmin)
custom_admin_site.register(Group, GroupAdmin)
custom_admin_site.register(Permission, type('PermissionAdmin', (
    ModernTemplateMixin, admin.ModelAdmin
), {
    'list_display': ['name', 'content_type', 'codename'],
    'list_filter': ['content_type'],
    'search_fields': ['name', 'codename'],
}))

# ─── 3. Enregistrer les modeles admin_custom ───
for model, admin_class in [(DashboardGrid, DashboardGridAdmin),
                            (DashboardChart, DashboardChartAdmin)]:
    if model in custom_admin_site._registry:
        custom_admin_site.unregister(model)
    custom_admin_site.register(model, admin_class)

# ─── 4. Personnaliser les titres ───
custom_admin_site.site_header = "GenDoc - Administration"  # Titre dans le header
custom_admin_site.site_title  = "GenDoc Admin"             # Titre de l'onglet
custom_admin_site.index_title = "Tableau de bord"          # Titre de la page d'accueil


urlpatterns = [
    path('admin/', custom_admin_site.urls),
    path('admin_custom/', include('admin_custom.urls')),   # API REST (graphiques, grilles)
    
    # API Documentation (Swagger/OpenAPI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # JWT Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Routes
    path('api/auth/', include('user.urls')),
    path('api/documents/', include('document.urls')),
    path('api/templates/', include('templates.urls')),
    # Optionnel : autres apps
    # path('api/users/', include('user.urls')),
]

# Servir les fichiers média en développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
 + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)