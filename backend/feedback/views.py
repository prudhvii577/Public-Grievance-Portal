from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class FeedbackDetailView(generics.RetrieveAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'complaint_id'

    def get_queryset(self):
        return Feedback.objects.all().select_related('citizen', 'complaint')

class FeedbackListView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Feedback.objects.all().select_related('citizen', 'complaint')
        elif user.role == 'officer':
            return Feedback.objects.filter(complaint__assigned_department=user.department).select_related('citizen', 'complaint')
        else:
            return Feedback.objects.filter(citizen=user).select_related('citizen', 'complaint')
