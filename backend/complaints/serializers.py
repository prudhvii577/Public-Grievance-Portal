from rest_framework import serializers
from .models import ComplaintCategory, Complaint, ComplaintAssignment, ComplaintHistory
from departments.serializers import DepartmentSerializer
from feedback.serializers import FeedbackSerializer

class ComplaintCategorySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='default_department.name', read_only=True)
    complaint_count = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintCategory
        fields = ['id', 'name', 'description', 'default_department', 'department_name', 'sla_days', 'is_active', 'complaint_count']

    def get_complaint_count(self, obj):
        return obj.complaints.count()

class ComplaintHistorySerializer(serializers.ModelSerializer):
    action_by_name = serializers.SerializerMethodField()
    action_by_role = serializers.CharField(source='action_by.role', read_only=True)

    class Meta:
        model = ComplaintHistory
        fields = ['id', 'status', 'action_by', 'action_by_name', 'action_by_role', 'action_type', 'remarks', 'timestamp']

    def get_action_by_name(self, obj):
        if obj.action_by:
            return obj.action_by.get_full_name() or obj.action_by.username
        return "System"

class ComplaintAssignmentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    assigned_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintAssignment
        fields = ['id', 'complaint', 'department', 'department_name', 'assigned_by', 'assigned_by_name', 'assigned_to', 'assigned_to_name', 'priority', 'notes', 'assigned_at']

    def get_assigned_by_name(self, obj):
        return obj.assigned_by.get_full_name() or obj.assigned_by.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return "Unassigned"

class ComplaintListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    citizen_name = serializers.SerializerMethodField()
    citizen_email = serializers.CharField(source='citizen.email', read_only=True)
    citizen_phone = serializers.CharField(source='citizen.phone_number', read_only=True)
    department_name = serializers.CharField(source='assigned_department.name', read_only=True)
    officer_name = serializers.SerializerMethodField()
    has_feedback = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_id', 'title', 'category', 'category_name',
            'citizen', 'citizen_name', 'citizen_email', 'citizen_phone',
            'location', 'address', 'image', 'submission_date',
            'assigned_department', 'department_name',
            'assigned_officer', 'officer_name',
            'priority', 'status', 'authority_remarks',
            'last_updated_date', 'has_feedback'
        ]

    def get_citizen_name(self, obj):
        return obj.citizen.get_full_name() or obj.citizen.username

    def get_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name() or obj.assigned_officer.username
        return "Not Assigned"

    def get_has_feedback(self, obj):
        return hasattr(obj, 'feedback')

class ComplaintDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    citizen_name = serializers.SerializerMethodField()
    citizen_email = serializers.CharField(source='citizen.email', read_only=True)
    citizen_phone = serializers.CharField(source='citizen.phone_number', read_only=True)
    department_name = serializers.CharField(source='assigned_department.name', read_only=True)
    officer_name = serializers.SerializerMethodField()
    history = ComplaintHistorySerializer(many=True, read_only=True)
    feedback = FeedbackSerializer(read_only=True)
    assignments = ComplaintAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_id', 'title', 'description',
            'category', 'category_name', 'citizen', 'citizen_name',
            'citizen_email', 'citizen_phone', 'location', 'address',
            'image', 'submission_date', 'assigned_department',
            'department_name', 'assigned_officer', 'officer_name',
            'priority', 'status', 'authority_remarks',
            'resolution_notes', 'reopen_reason', 'last_updated_date',
            'history', 'feedback', 'assignments'
        ]

    def get_citizen_name(self, obj):
        return obj.citizen.get_full_name() or obj.citizen.username

    def get_officer_name(self, obj):
        if obj.assigned_officer:
            return obj.assigned_officer.get_full_name() or obj.assigned_officer.username
        return "Not Assigned"

class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'category', 'location', 'address', 'image']

    def create(self, validated_data):
        user = self.context['request'].user
        category = validated_data.get('category')
        
        # Auto-assign department if category has a default department
        assigned_department = category.default_department if category else None

        complaint = Complaint.objects.create(
            citizen=user,
            assigned_department=assigned_department,
            status='Submitted',
            **validated_data
        )

        # Create initial audit history record
        ComplaintHistory.objects.create(
            complaint=complaint,
            status='Submitted',
            action_by=user,
            action_type='Complaint Submitted',
            remarks='Grievance lodged successfully by citizen.'
        )

        return complaint
