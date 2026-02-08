from django.urls import path
from .views import RegisterAPIView, MeAPIView, LogoutAPIView

app_name = "user"

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("me/", MeAPIView.as_view(), name="me"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
]
