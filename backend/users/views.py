from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    AdminUserManagementSerializer,
    ChangePasswordSerializer
)
from .authentication import generate_jwt_token
from .permissions import IsAdmin

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = generate_jwt_token(user)
            return Response({
                'message': 'Registration successful! Welcome to Public Grievance Redressal Portal.',
                'token': token,
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = generate_jwt_token(user)
            return Response({
                'message': 'Login successful.',
                'token': token,
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserManagementView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserManagementSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = User.objects.all().select_related('department')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        department = self.request.query_params.get('department')

        if role:
            queryset = queryset.filter(role=role)
        if department:
            queryset = queryset.filter(department_id=department)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone_number__icontains=search)
            )
        return queryset

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserManagementSerializer
    queryset = User.objects.all()

    def perform_destroy(self, instance):
        # Instead of hard delete, deactivate the user to maintain foreign key integrity with complaints
        instance.is_active = False
        instance.save()

class OfficerListView(APIView):
    """
    List of active officers for assigning complaints.
    Can filter by department.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['admin', 'officer']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        department_id = request.query_params.get('department')
        officers = User.objects.filter(role='officer', is_active=True).select_related('department')
        if department_id:
            officers = officers.filter(department_id=department_id)

        data = [{
            'id': o.id,
            'name': o.get_full_name() or o.username,
            'email': o.email,
            'department_id': o.department_id,
            'department_name': o.department.name if o.department else None,
            'designation': o.designation
        } for o in officers]

        return Response(data)
