from django.urls import path
from .views import FeedbackCreateView, FeedbackDetailView, FeedbackListView

urlpatterns = [
    path('', FeedbackListView.as_view(), name='feedback_list'),
    path('submit/', FeedbackCreateView.as_view(), name='feedback_submit'),
    path('complaint/<int:complaint_id>/', FeedbackDetailView.as_view(), name='feedback_by_complaint'),
]
