import uuid
from datetime import datetime
from django.db import models
from django.conf import settings
from departments.models import Department

class ComplaintCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    default_department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='categories'
    )
    sla_days = models.PositiveIntegerField(default=7)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ComplaintCategories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Complaint(models.Model):
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    STATUS_CHOICES = (
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Reopened', 'Reopened'),
        ('Rejected', 'Rejected'),
    )

    complaint_id = models.CharField(max_length=50, unique=True, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(ComplaintCategory, on_delete=models.PROTECT, related_name='complaints')
    citizen = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    location = models.CharField(max_length=255)
    address = models.TextField()
    image = models.ImageField(upload_to='complaints/%Y/%m/', null=True, blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    assigned_department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Submitted')
    authority_remarks = models.TextField(blank=True, default='')
    resolution_notes = models.TextField(blank=True, default='')
    reopen_reason = models.TextField(blank=True, default='')
    last_updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Complaints'
        ordering = ['-submission_date']

    def __str__(self):
        return f"{self.complaint_id} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.complaint_id:
            # Generate Unique Tracking ID: PGRP-YYYYMM-XXXX
            prefix = datetime.now().strftime("PGRP-%Y%m")
            random_suffix = uuid.uuid4().hex[:5].upper()
            self.complaint_id = f"{prefix}-{random_suffix}"
            while Complaint.objects.filter(complaint_id=self.complaint_id).exists():
                random_suffix = uuid.uuid4().hex[:5].upper()
                self.complaint_id = f"{prefix}-{random_suffix}"
        super().save(*args, **kwargs)

class ComplaintAssignment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='assignments')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments_made')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments_received')
    priority = models.CharField(max_length=20, default='Medium')
    notes = models.TextField(blank=True, default='')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ComplaintAssignments'
        ordering = ['-assigned_at']

    def __str__(self):
        return f"Assignment for {self.complaint.complaint_id} to {self.department.name}"

class ComplaintHistory(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=30)
    action_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50)
    remarks = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ComplaintHistory'
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.complaint.complaint_id} - {self.action_type} ({self.status}) at {self.timestamp}"
