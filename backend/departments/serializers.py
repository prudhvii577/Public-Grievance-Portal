from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    officer_count = serializers.SerializerMethodField()
    complaint_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'contact_email',
            'contact_phone', 'head_officer_name', 'is_active',
            'created_at', 'updated_at', 'officer_count', 'complaint_count'
        ]

    def get_officer_count(self, obj):
        return obj.officers.count()

    def get_complaint_count(self, obj):
        return obj.assigned_complaints.count()
