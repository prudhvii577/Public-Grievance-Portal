from django.db import models
from django.conf import settings
from complaints.models import Complaint

class Feedback(models.Model):
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='feedback')
    citizen = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comments = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Feedback'
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.complaint.complaint_id} - Rating {self.rating}/5"
