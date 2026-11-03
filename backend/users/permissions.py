from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['officer', 'admin'])

class IsCitizen(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'citizen')

class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'admin':
            return True
        if request.user.role == 'officer':
            # Officer can access if assigned to them or their department
            if hasattr(obj, 'assigned_officer') and obj.assigned_officer == request.user:
                return True
            if hasattr(obj, 'assigned_department') and obj.assigned_department == request.user.department:
                return True
            return False
        # Citizen
        if hasattr(obj, 'citizen'):
            return obj.citizen == request.user
        return False
