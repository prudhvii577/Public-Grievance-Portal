import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from departments.models import Department
from complaints.models import ComplaintCategory, Complaint, ComplaintAssignment, ComplaintHistory
from feedback.models import Feedback

User = get_user_model()

def seed():
    print("--- Starting Database Seeding ---")

    # 1. Create Departments
    departments_data = [
        {
            "name": "Roads & Bridges Department",
            "code": "ROADS",
            "description": "Maintenance of city roads, potholes, pavements, and flyovers.",
            "contact_email": "roads@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6780",
            "head_officer_name": "Er. Vikram Malhotra"
        },
        {
            "name": "Water Supply & Sewerage Board",
            "code": "WATER",
            "description": "Potable water distribution, pipeline leak repairs, and water contamination checks.",
            "contact_email": "water@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6781",
            "head_officer_name": "Er. S. Venkatraman"
        },
        {
            "name": "Solid Waste & Sanitation Management",
            "code": "WASTE",
            "description": "Daily garbage collection, community dustbins, and zero-waste initiatives.",
            "contact_email": "sanitation@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6782",
            "head_officer_name": "Dr. Neha Kulkarni"
        },
        {
            "name": "Drainage & Stormwater Department",
            "code": "DRAIN",
            "description": "Drain cleaning, monsoon flood mitigation, and underground sewer maintenance.",
            "contact_email": "drainage@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6783",
            "head_officer_name": "Er. Rajesh Verma"
        },
        {
            "name": "Electricity & Street Lighting Board",
            "code": "ELECT",
            "description": "Public streetlight poles, transformer repairs, and municipal power grids.",
            "contact_email": "electricity@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6784",
            "head_officer_name": "Er. Priya Sharma"
        },
        {
            "name": "Public Health & Civic Hygiene",
            "code": "HEALTH",
            "description": "Mosquito fogging, stray animal control, public restrooms maintenance.",
            "contact_email": "health@pgrp.gov.in",
            "contact_phone": "+91 11 2345 6785",
            "head_officer_name": "Dr. Arvind Swaminathan"
        }
    ]

    dept_objs = {}
    for d in departments_data:
        dept, created = Department.objects.get_or_create(code=d['code'], defaults=d)
        dept_objs[d['code']] = dept
        if created:
            print(f"Created Department: {dept.name}")
        else:
            print(f"Department exists: {dept.name}")

    # 2. Create Predefined Categories
    categories_data = [
        {
            "name": "Road Damage",
            "description": "Potholes, broken asphalt, damaged footpaths, or cave-ins.",
            "default_department": dept_objs["ROADS"],
            "sla_days": 5
        },
        {
            "name": "Water Supply Issues",
            "description": "Disrupted tap water supply, low water pressure, contaminated water, or burst pipes.",
            "default_department": dept_objs["WATER"],
            "sla_days": 3
        },
        {
            "name": "Garbage Collection",
            "description": "Uncollected trash heaps, overflowing public dustbins, and irregular garbage trucks.",
            "default_department": dept_objs["WASTE"],
            "sla_days": 2
        },
        {
            "name": "Drainage Problems",
            "description": "Clogged stormwater drains, water-logging during rains, and open manholes.",
            "default_department": dept_objs["DRAIN"],
            "sla_days": 4
        },
        {
            "name": "Streetlight Issues",
            "description": "Flickering lights, dark streets at night, or exposed electrical wiring on poles.",
            "default_department": dept_objs["ELECT"],
            "sla_days": 3
        },
        {
            "name": "Electricity Problems",
            "description": "Substation transformer sparkings, loose high-voltage cables, or municipal power cut.",
            "default_department": dept_objs["ELECT"],
            "sla_days": 2
        },
        {
            "name": "Public Sanitation",
            "description": "Dirty public toilets, stagnant sewage pools, and pest breeding areas.",
            "default_department": dept_objs["HEALTH"],
            "sla_days": 3
        },
        {
            "name": "Other Civic Issues",
            "description": "General civic infrastructure inquiries, encroached sidewalks, or nuisance complaints.",
            "default_department": dept_objs["ROADS"],
            "sla_days": 7
        }
    ]

    cat_objs = {}
    for cat in categories_data:
        obj, created = ComplaintCategory.objects.get_or_create(name=cat['name'], defaults=cat)
        cat_objs[cat['name']] = obj
        if created:
            print(f"Created Category: {obj.name}")

    # 3. Create Users
    # Admin
    admin_user, created = User.objects.get_or_create(
        email="admin@pgrp.gov.in",
        defaults={
            "username": "admin",
            "first_name": "Chief Admin",
            "last_name": "Officer",
            "role": "admin",
            "phone_number": "+91 98765 43210",
            "address": "Municipal Corporation Headquarters, Civil Lines, New Delhi",
            "is_staff": True,
            "is_superuser": True
        }
    )
    if created:
        admin_user.set_password("Admin@123")
        admin_user.save()
        print("Created Administrator: admin@pgrp.gov.in / Admin@123")

    # Officers
    officer_roads, created = User.objects.get_or_create(
        email="officer.roads@pgrp.gov.in",
        defaults={
            "username": "officer_roads",
            "first_name": "Vikram",
            "last_name": "Malhotra",
            "role": "officer",
            "phone_number": "+91 98111 22334",
            "address": "PWD Division Office, Sector 4",
            "department": dept_objs["ROADS"],
            "designation": "Executive Engineer"
        }
    )
    if created:
        officer_roads.set_password("Officer@123")
        officer_roads.save()
        print("Created Officer: officer.roads@pgrp.gov.in / Officer@123")

    officer_water, created = User.objects.get_or_create(
        email="officer.water@pgrp.gov.in",
        defaults={
            "username": "officer_water",
            "first_name": "Venkat",
            "last_name": "Raman",
            "role": "officer",
            "phone_number": "+91 98222 33445",
            "address": "Jal Bhawan, Water Works Circle",
            "department": dept_objs["WATER"],
            "designation": "Assistant Engineer (Water Supply)"
        }
    )
    if created:
        officer_water.set_password("Officer@123")
        officer_water.save()
        print("Created Officer: officer.water@pgrp.gov.in / Officer@123")

    # Citizens
    citizen_1, created = User.objects.get_or_create(
        email="citizen.ramesh@gmail.com",
        defaults={
            "username": "ramesh_kumar",
            "first_name": "Ramesh",
            "last_name": "Kumar",
            "role": "citizen",
            "phone_number": "+91 97111 55667",
            "address": "Flat 304, Shanti Apartments, Mayur Vihar Phase 1, Delhi"
        }
    )
    if created:
        citizen_1.set_password("Citizen@123")
        citizen_1.save()
        print("Created Citizen: citizen.ramesh@gmail.com / Citizen@123")

    citizen_2, created = User.objects.get_or_create(
        email="citizen.ananya@gmail.com",
        defaults={
            "username": "ananya_singh",
            "first_name": "Ananya",
            "last_name": "Singh",
            "role": "citizen",
            "phone_number": "+91 99555 88990",
            "address": "House 42, Green Park Extension, New Delhi"
        }
    )
    if created:
        citizen_2.set_password("Citizen@123")
        citizen_2.save()
        print("Created Citizen: citizen.ananya@gmail.com / Citizen@123")

    # 4. Create Initial Realistic Complaints
    c1, created = Complaint.objects.get_or_create(
        title="Severe Potholes causing traffic hazard near Market Gate 3",
        defaults={
            "description": "Deep craters and potholes formed after recent rainfalls. Two-wheelers are skidding constantly during peak morning hours.",
            "category": cat_objs["Road Damage"],
            "citizen": citizen_1,
            "location": "Main Central Road, Opposite Market Gate 3",
            "address": "Central Market Road, Block B, Mayur Vihar, New Delhi - 110091",
            "assigned_department": dept_objs["ROADS"],
            "assigned_officer": officer_roads,
            "priority": "High",
            "status": "In Progress",
            "authority_remarks": "Asphalt patch truck dispatched. Road repair squad deployed on site.",
        }
    )
    if created:
        ComplaintHistory.objects.create(
            complaint=c1,
            status="Submitted",
            action_by=citizen_1,
            action_type="Complaint Submitted",
            remarks="Grievance registered with photographs by citizen."
        )
        ComplaintHistory.objects.create(
            complaint=c1,
            status="Assigned",
            action_by=admin_user,
            action_type="Grievance Assigned",
            remarks="Assigned to Roads & Bridges Department under Officer Vikram Malhotra."
        )
        ComplaintHistory.objects.create(
            complaint=c1,
            status="In Progress",
            action_by=officer_roads,
            action_type="Work in Progress",
            remarks="Asphalt patch truck dispatched. Repair squad deployed on site."
        )
        print(f"Created Complaint: {c1.complaint_id} (In Progress)")

    c2, created = Complaint.objects.get_or_create(
        title="Contaminated muddy water coming from municipal taps for 3 days",
        defaults={
            "description": "Brownish muddy water with strong odor flowing from taps in entire Lane 4. Unfit for drinking and domestic use.",
            "category": cat_objs["Water Supply Issues"],
            "citizen": citizen_2,
            "location": "Near Water Tank, Green Park Ext Lane 4",
            "address": "Lane 4, Green Park Extension, New Delhi - 110016",
            "assigned_department": dept_objs["WATER"],
            "assigned_officer": officer_water,
            "priority": "Critical",
            "status": "Resolved",
            "authority_remarks": "Pipeline joint crack located and welded. Sump flushed and chlorine dosage tested normal.",
            "resolution_notes": "Main distribution feeder pipe repaired. Water quality tested safe by laboratory."
        }
    )
    if created:
        ComplaintHistory.objects.create(
            complaint=c2,
            status="Submitted",
            action_by=citizen_2,
            action_type="Complaint Submitted",
            remarks="Urgent grievance submitted regarding water contamination."
        )
        ComplaintHistory.objects.create(
            complaint=c2,
            status="In Progress",
            action_by=officer_water,
            action_type="Inspection Underway",
            remarks="Field technician inspected pipeline valve."
        )
        ComplaintHistory.objects.create(
            complaint=c2,
            status="Resolved",
            action_by=officer_water,
            action_type="Grievance Resolved",
            remarks="Pipeline joint crack repaired and water samples verified clean."
        )
        # Create Feedback
        Feedback.objects.create(
            complaint=c2,
            citizen=citizen_2,
            rating=5,
            comments="Very prompt resolution! The team visited within 24 hours and fixed the pipeline leak. Clean water restored."
        )
        print(f"Created Complaint: {c2.complaint_id} (Resolved with Feedback)")

    c3, created = Complaint.objects.get_or_create(
        title="Garbage bin overflowing and spreading onto pedestrian walkway",
        defaults={
            "description": "Garbage has not been collected for 4 consecutive days. Stray cattle and dogs are scattering waste across the road.",
            "category": cat_objs["Garbage Collection"],
            "citizen": citizen_1,
            "location": "Corner of Sector 12 and Ring Road junction",
            "address": "Corner Plot 12, Sector 12, New Delhi",
            "assigned_department": dept_objs["WASTE"],
            "priority": "Medium",
            "status": "Submitted",
            "authority_remarks": "Pending assignment to sanitation zone supervisor.",
        }
    )
    if created:
        ComplaintHistory.objects.create(
            complaint=c3,
            status="Submitted",
            action_by=citizen_1,
            action_type="Complaint Submitted",
            remarks="New complaint registered by citizen."
        )
        print(f"Created Complaint: {c3.complaint_id} (Submitted)")

    c4, created = Complaint.objects.get_or_create(
        title="Five consecutive streetlights non-functional creating pitch dark zone",
        defaults={
            "description": "Streetlight poles #14 through #18 on 5th cross road are not lighting up at night. Several chain-snatching incidents reported in this dark stretch.",
            "category": cat_objs["Streetlight Issues"],
            "citizen": citizen_2,
            "location": "5th Cross Road, Near Community Park",
            "address": "5th Cross Road, Green Park Ext, New Delhi",
            "assigned_department": dept_objs["ELECT"],
            "priority": "High",
            "status": "Assigned",
            "authority_remarks": "Assigned to Electrical maintenance crew for transformer fuse check.",
        }
    )
    if created:
        ComplaintHistory.objects.create(
            complaint=c4,
            status="Submitted",
            action_by=citizen_2,
            action_type="Complaint Submitted",
            remarks="Streetlight issue logged."
        )
        ComplaintHistory.objects.create(
            complaint=c4,
            status="Assigned",
            action_by=admin_user,
            action_type="Grievance Assigned",
            remarks="Assigned to Electricity & Street Lighting Board."
        )
        print(f"Created Complaint: {c4.complaint_id} (Assigned)")

    print("--- Database Seeding Finished Successfully ---")

if __name__ == '__main__':
    seed()
