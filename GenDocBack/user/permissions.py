from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission permettant uniquement aux administrateurs (is_staff) d'accéder.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

class IsClientUser(permissions.BasePermission):
    """
    Permission permettant aux clients authentifiés d'accéder à leurs propres ressources.
    """
    def has_permission(self, request, view):
        # Un client est un utilisateur authentifié qui n'est pas forcément staff
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Vérifie que l'objet appartient bien à l'utilisateur (ex: une commande)
        # On suppose que l'objet a un champ 'user'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
