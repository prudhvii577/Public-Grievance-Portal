from datetime import datetime, timedelta
from django.db.models import Count, Q, Avg, F
from django.utils import timezone
from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ComplaintCategory, Complaint, ComplaintAssignment, ComplaintHistory
from .serializers import (
    ComplaintCategorySerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintHistorySerializer,
)
from users.models import User
from departments.models import Department

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = ComplaintCategory.objects.all()
    serializer_class = ComplaintCategorySerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = ComplaintCategory.objects.all()
        # Non-admins only see active categories
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.role == 'admin'):
            queryset = queryset.filter(is_active=True)
        return queryset

class ComplaintViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action == 'retrieve':
            return ComplaintDetailSerializer
        return ComplaintListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Complaint.objects.select_related(
            'category', 'citizen', 'assigned_department', 'assigned_officer'
        ).prefetch_related('history')

        # Role-based scoping
        if user.role == 'citizen':
            queryset = queryset.filter(citizen=user)
        elif user.role == 'officer':
            if user.department:
                queryset = queryset.filter(
                    Q(assigned_department=user.department) | Q(assigned_officer=user)
                )
            else:
                queryset = queryset.filter(assigned_officer=user)
        elif user.role == 'admin':
            pass # Admins see all

        # Filtering parameters
        category_id = self.request.query_params.get('category')
        dept_id = self.request.query_params.get('department')
        status_val = self.request.query_params.get('status')
        priority_val = self.request.query_params.get('priority')
        search = self.request.query_params.get('search')
        assigned_to_me = self.request.query_params.get('assigned_to_me')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if dept_id:
            queryset = queryset.filter(assigned_department_id=dept_id)
        if status_val:
            queryset = queryset.filter(status=status_val)
        if priority_val:
            queryset = queryset.filter(priority=priority_val)
        if assigned_to_me and user.role == 'officer':
            queryset = queryset.filter(assigned_officer=user)

        if search:
            queryset = queryset.filter(
                Q(complaint_id__icontains=search) |
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search) |
                Q(citizen__first_name__icontains=search) |
                Q(citizen__last_name__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='track/(?P<tracking_id>[^/.]+)')
    def track_by_id(self, request, tracking_id=None):
        """Public or citizen tracking endpoint by unique ID."""
        try:
            complaint = Complaint.objects.select_related(
                'category', 'citizen', 'assigned_department', 'assigned_officer'
            ).prefetch_related('history', 'feedback').get(complaint_id__iexact=tracking_id)
        except Complaint.DoesNotExist:
            return Response({'error': f'No grievance found with tracking ID: {tracking_id}'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ComplaintDetailSerializer(complaint)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        """Admin assigns complaint to department and officer, sets priority."""
        if request.user.role != 'admin':
            return Response({'error': 'Only administrators can assign grievances.'}, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()
        department_id = request.data.get('department_id')
        officer_id = request.data.get('officer_id')
        priority = request.data.get('priority', complaint.priority)
        notes = request.data.get('notes', '')

        if not department_id:
            return Response({'error': 'Please select a department to assign.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response({'error': 'Invalid department.'}, status=status.HTTP_400_BAD_REQUEST)

        officer = None
        if officer_id:
            try:
                officer = User.objects.get(id=officer_id, role='officer')
            except User.DoesNotExist:
                return Response({'error': 'Invalid officer.'}, status=status.HTTP_400_BAD_REQUEST)

        complaint.assigned_department = department
        complaint.assigned_officer = officer
        complaint.priority = priority

        # Advance status to Assigned if currently Submitted or Under Review
        old_status = complaint.status
        if complaint.status in ['Submitted', 'Under Review']:
            complaint.status = 'Assigned'

        if notes:
            complaint.authority_remarks = notes

        complaint.save()

        # Log Assignment record
        ComplaintAssignment.objects.create(
            complaint=complaint,
            department=department,
            assigned_by=request.user,
            assigned_to=officer,
            priority=priority,
            notes=notes
        )

        # Log History record
        officer_str = f" and assigned to Officer {officer.get_full_name() or officer.username}" if officer else ""
        history_remarks = f"Assigned to {department.name}{officer_str}. Priority set to {priority}. {notes}".strip()
        ComplaintHistory.objects.create(
            complaint=complaint,
            status=complaint.status,
            action_by=request.user,
            action_type='Grievance Assigned',
            remarks=history_remarks
        )

        serializer = ComplaintDetailSerializer(complaint)
        return Response({
            'message': f'Grievance {complaint.complaint_id} assigned successfully.',
            'complaint': serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        """Department Officer or Admin updates status, remarks, and resolution notes."""
        if request.user.role not in ['officer', 'admin']:
            return Response({'error': 'Unauthorized to update grievance status.'}, status=status.HTTP_403_FORBIDDEN)

        complaint = self.get_object()

        # Check if officer belongs to assigned department
        if request.user.role == 'officer':
            if complaint.assigned_department and request.user.department != complaint.assigned_department:
                return Response({'error': 'You can only update grievances assigned to your department.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        remarks = request.data.get('remarks', '')
        resolution_notes = request.data.get('resolution_notes', '')

        valid_statuses = [choice[0] for choice in Complaint.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = complaint.status
        complaint.status = new_status

        if remarks:
            complaint.authority_remarks = remarks
        if new_status == 'Resolved':
            complaint.resolution_notes = resolution_notes or remarks or 'Issue inspected and resolved.'

        complaint.save()

        # Record in history
        action_title = f"Status Changed to {new_status}"
        if new_status == 'Resolved':
            action_title = "Grievance Resolved"
        elif new_status == 'In Progress':
            action_title = "Work in Progress"

        ComplaintHistory.objects.create(
            complaint=complaint,
            status=new_status,
            action_by=request.user,
            action_type=action_title,
            remarks=remarks or f"Status transitioned from {prev_status} to {new_status}."
        )

        serializer = ComplaintDetailSerializer(complaint)
        return Response({
            'message': f'Status updated to {new_status} successfully.',
            'complaint': serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reopen(self, request, pk=None):
        """Citizen can reopen their grievance if dissatisfied with resolution."""
        complaint = self.get_object()

        if request.user.role != 'citizen' or complaint.citizen != request.user:
            return Response({'error': 'Only the complaint owner can reopen this grievance.'}, status=status.HTTP_403_FORBIDDEN)

        if complaint.status not in ['Resolved', 'Rejected']:
            return Response({'error': 'Only resolved or rejected grievances can be reopened.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Please provide a clear reason for reopening this grievance.'}, status=status.HTTP_400_BAD_REQUEST)

        complaint.status = 'Reopened'
        complaint.reopen_reason = reason
        complaint.save()

        ComplaintHistory.objects.create(
            complaint=complaint,
            status='Reopened',
            action_by=request.user,
            action_type='Grievance Reopened',
            remarks=f"Citizen reopened the grievance: {reason}"
        )

        serializer = ComplaintDetailSerializer(complaint)
        return Response({
            'message': 'Grievance has been reopened. Department officers will review the matter.',
            'complaint': serializer.data
        })


class DashboardStatsView(APIView):
    """Calculates real, database-driven metrics for each user role."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'citizen':
            complaints = Complaint.objects.filter(citizen=user)
            total = complaints.count()
            pending = complaints.filter(status__in=['Submitted', 'Under Review', 'Assigned']).count()
            in_progress = complaints.filter(status__in=['In Progress', 'Reopened']).count()
            resolved = complaints.filter(status='Resolved').count()
            rejected = complaints.filter(status='Rejected').count()

            recent = ComplaintListSerializer(complaints[:5], many=True).data

            return Response({
                'role': 'citizen',
                'stats': {
                    'total': total,
                    'pending': pending,
                    'in_progress': in_progress,
                    'resolved': resolved,
                    'rejected': rejected
                },
                'recent_complaints': recent
            })

        elif user.role == 'officer':
            dept = user.department
            if dept:
                qs = Complaint.objects.filter(Q(assigned_department=dept) | Q(assigned_officer=user))
            else:
                qs = Complaint.objects.filter(assigned_officer=user)

            total = qs.count()
            pending = qs.filter(status__in=['Submitted', 'Under Review', 'Assigned']).count()
            in_progress = qs.filter(status__in=['In Progress', 'Reopened']).count()
            resolved = qs.filter(status='Resolved').count()
            high_priority = qs.filter(priority__in=['High', 'Critical'], status__in=['Submitted', 'Assigned', 'In Progress']).count()
            assigned_directly = qs.filter(assigned_officer=user).count()

            recent = ComplaintListSerializer(qs[:5], many=True).data

            return Response({
                'role': 'officer',
                'department': dept.name if dept else "Unassigned Department",
                'stats': {
                    'total': total,
                    'pending': pending,
                    'in_progress': in_progress,
                    'resolved': resolved,
                    'high_priority': high_priority,
                    'assigned_to_me': assigned_directly
                },
                'recent_complaints': recent
            })

        elif user.role == 'admin':
            total_citizens = User.objects.filter(role='citizen').count()
            total_officers = User.objects.filter(role='officer').count()
            total_departments = Department.objects.count()

            all_complaints = Complaint.objects.all()
            total = all_complaints.count()
            pending = all_complaints.filter(status__in=['Submitted', 'Under Review', 'Assigned']).count()
            in_progress = all_complaints.filter(status__in=['In Progress', 'Reopened']).count()
            resolved = all_complaints.filter(status='Resolved').count()
            rejected = all_complaints.filter(status='Rejected').count()

            # Category-wise analysis
            category_counts = ComplaintCategory.objects.annotate(
                count=Count('complaints')
            ).values('id', 'name', 'count')

            # Department-wise analysis
            dept_counts = Department.objects.annotate(
                count=Count('assigned_complaints')
            ).values('id', 'name', 'code', 'count')

            # Priority breakdown
            priority_counts = all_complaints.values('priority').annotate(count=Count('id'))

            # Status breakdown
            status_counts = all_complaints.values('status').annotate(count=Count('id'))

            recent = ComplaintListSerializer(all_complaints[:8], many=True).data

            return Response({
                'role': 'admin',
                'stats': {
                    'total_citizens': total_citizens,
                    'total_officers': total_officers,
                    'total_departments': total_departments,
                    'total_complaints': total,
                    'pending': pending,
                    'in_progress': in_progress,
                    'resolved': resolved,
                    'rejected': rejected
                },
                'category_breakdown': list(category_counts),
                'department_breakdown': list(dept_counts),
                'priority_breakdown': list(priority_counts),
                'status_breakdown': list(status_counts),
                'recent_complaints': recent
            })

        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)


class ReportsAnalyticsView(APIView):
    """Detailed analytics and exportable report generation for administrators."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Administrator access required.'}, status=status.HTTP_403_FORBIDDEN)

        all_complaints = Complaint.objects.select_related('assigned_department', 'category', 'citizen')
        total_count = all_complaints.count()

        # Department performance metrics
        departments = Department.objects.all()
        dept_metrics = []
        for d in departments:
            d_complaints = all_complaints.filter(assigned_department=d)
            d_total = d_complaints.count()
            d_resolved = d_complaints.filter(status='Resolved').count()
            d_pending = d_complaints.filter(status__in=['Submitted', 'Under Review', 'Assigned']).count()
            d_in_progress = d_complaints.filter(status__in=['In Progress', 'Reopened']).count()
            res_rate = round((d_resolved / d_total * 100), 1) if d_total > 0 else 0.0

            dept_metrics.append({
                'department_id': d.id,
                'department_name': d.name,
                'department_code': d.code,
                'total_assigned': d_total,
                'resolved': d_resolved,
                'pending': d_pending,
                'in_progress': d_in_progress,
                'resolution_rate': res_rate,
            })

        # Category analytics
        categories = ComplaintCategory.objects.all()
        cat_metrics = []
        for c in categories:
            c_complaints = all_complaints.filter(category=c)
            c_total = c_complaints.count()
            c_resolved = c_complaints.filter(status='Resolved').count()
            pct = round((c_total / total_count * 100), 1) if total_count > 0 else 0.0

            cat_metrics.append({
                'category_id': c.id,
                'category_name': c.name,
                'total_complaints': c_total,
                'resolved': c_resolved,
                'percentage': pct,
            })

        # Overall summary stats
        resolved_count = all_complaints.filter(status='Resolved').count()
        overall_resolution_rate = round((resolved_count / total_count * 100), 1) if total_count > 0 else 0.0

        return Response({
            'generated_at': timezone.now().isoformat(),
            'summary': {
                'total_complaints': total_count,
                'resolved_complaints': resolved_count,
                'pending_complaints': all_complaints.filter(status__in=['Submitted', 'Under Review', 'Assigned']).count(),
                'in_progress_complaints': all_complaints.filter(status__in=['In Progress', 'Reopened']).count(),
                'overall_resolution_rate': overall_resolution_rate,
            },
            'department_performance': dept_metrics,
            'category_distribution': cat_metrics,
        })
