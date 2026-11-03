from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ComplaintViewSet, DashboardStatsView, ReportsAnalyticsView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('stats/dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('reports/analytics/', ReportsAnalyticsView.as_view(), name='reports_analytics'),
    path('', include(router.urls)),
]
