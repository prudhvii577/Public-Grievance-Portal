from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Department
from .serializers import DepartmentSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None  # Return full list for easy dropdown selections

    def get_queryset(self):
        queryset = Department.objects.all()
        # If not admin, only show active departments
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.role == 'admin'):
            queryset = queryset.filter(is_active=True)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_status(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        dept = self.get_object()
        dept.is_active = not dept.is_active
        dept.save()
        return Response({'status': 'success', 'is_active': dept.is_active})
