from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    complaint_tracking_id = serializers.CharField(source='complaint.complaint_id', read_only=True)
    complaint_title = serializers.CharField(source='complaint.title', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'complaint', 'complaint_tracking_id', 'complaint_title',
            'citizen', 'citizen_name', 'rating', 'comments', 'created_at'
        ]
        read_only_fields = ['id', 'citizen', 'created_at']

    def validate(self, attrs):
        complaint = attrs.get('complaint')
        user = self.context['request'].user
        
        # Only the citizen who filed the complaint can submit feedback
        if complaint.citizen != user:
            raise serializers.ValidationError("You can only submit feedback for complaints you created.")
            
        # Can only submit feedback for resolved complaints
        if complaint.status != 'Resolved':
            raise serializers.ValidationError("Feedback can only be submitted for Resolved complaints.")
            
        # Check if feedback already exists
        if Feedback.objects.filter(complaint=complaint).exists():
            raise serializers.ValidationError("Feedback has already been submitted for this complaint.")

        return attrs

    def create(self, validated_data):
        validated_data['citizen'] = self.context['request'].user
        return super().create(validated_data)
