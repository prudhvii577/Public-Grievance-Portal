import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User

def generate_jwt_token(user):
    """Generate a JWT token valid for 7 days."""
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user.id,
        'email': user.email,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'department_id': user.department_id if user.department else None,
        'department_name': user.department.name if user.department else None,
        'exp': now + timedelta(days=7),
        'iat': now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT Authentication using PyJWT.
    Accepts Authorization header with 'Bearer <token>'.
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Session token has expired. Please log in again.')
        except (jwt.InvalidTokenError, Exception) as e:
            raise exceptions.AuthenticationFailed(f'Invalid authentication token: {str(e)}')

        try:
            user = User.objects.select_related('department').get(id=payload['user_id'])
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User account no longer exists.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('This user account has been deactivated.')

        return (user, token)
