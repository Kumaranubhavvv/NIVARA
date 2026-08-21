import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.api.router import api_router
from app.domains.users.models import User
from app.domains.caregivers.models import Caregiver
from app.domains.community.models import Group, GroupMember, Post, Comment, Resource, Event, SavedPost
from app.models.child import Child
from app.models.device import Device
from app.models.location import Location
from app.models.safe_zone import SafeZone
from app.models.emergency import EmergencyAlert
from app.models.emergency_contact import EmergencyContact
from app.models.safety_event import SafetyEvent

app = FastAPI(title="NIVARA Caregiver Community API", version="1.0.0")

# Enable CORS for frontend web and mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static upload directory exists and mount static files
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

from app.api.v1.community.sound_routes import router as sound_router
from app.api.v1.community.social_routes import router as social_router

# Include master API router
app.include_router(api_router, prefix="/api")

# Top-level alias routers for social interactions and sounds
app.include_router(social_router)
app.include_router(sound_router, prefix="/api")
app.include_router(sound_router)

@app.get("/")
def root():
    return {"message": "NIVARA Caregiver Community API", "status": "ok", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

def startup_event():
    # If existing DB schema lacks new columns, reset tables
    try:
        inspector = inspect(engine)
        if "groups" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("groups")]
            if "avatar_url" not in columns:
                Base.metadata.drop_all(bind=engine)
    except Exception:
        pass

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed test users if not present
        sarah = db.query(User).filter(User.email == "sarah@nivara.app").first()
        if not sarah:
            sarah = User(
                id="user-verified-sarah",
                email="sarah@nivara.app",
                hashed_password=get_password_hash("password123"),
                full_name="Sarah Mitchell",
                role="caregiver",
            )
            db.add(sarah)
            db.commit()
            db.refresh(sarah)

            sarah_cg = Caregiver(
                user_id=sarah.id,
                bio="ABA therapist & caregiver",
                is_verified=True,
                verification_status="verified",
                is_online=True,
            )
            db.add(sarah_cg)
            db.commit()

        david = db.query(User).filter(User.email == "david@nivara.app").first()
        if not david:
            david = User(
                id="user-verified-david",
                email="david@nivara.app",
                hashed_password=get_password_hash("password123"),
                full_name="David Nguyen",
                role="caregiver",
            )
            db.add(david)
            db.commit()
            db.refresh(david)

            david_cg = Caregiver(
                user_id=david.id,
                bio="Special education teacher & caregiver",
                is_verified=True,
                verification_status="verified",
                is_online=False,
            )
            db.add(david_cg)
            db.commit()

        lisa = db.query(User).filter(User.email == "lisa@nivara.app").first()
        if not lisa:
            lisa = User(
                id="user-unverified-lisa",
                email="lisa@nivara.app",
                hashed_password=get_password_hash("password123"),
                full_name="Lisa Chen",
                role="caregiver",
            )
            db.add(lisa)
            db.commit()
            db.refresh(lisa)

            lisa_cg = Caregiver(
                user_id=lisa.id,
                bio="Parent caregiver",
                is_verified=False,
                verification_status="pending",
                is_online=False,
            )
            db.add(lisa_cg)
            db.commit()

        # Seed group-sensory-1 for Phase 5 tests if not present
        group = db.query(Group).filter(Group.id == "group-sensory-1").first()
        if not group:
            group = Group(
                id="group-sensory-1",
                name="Sensory Support Circle",
                description="Share sensory tools and strategies",
                category="Sensory",
                creator_id="user-verified-sarah",
            )
            db.add(group)
            db.commit()

            sarah_gm = GroupMember(
                group_id="group-sensory-1",
                user_id="user-verified-sarah",
                role="admin",
            )
            db.add(sarah_gm)
            db.commit()

        # Seed group-newly-diagnosed-1 if not present
        group_nd = db.query(Group).filter(Group.id == "group-newly-diagnosed-1").first()
        if not group_nd:
            group_nd = Group(
                id="group-newly-diagnosed-1",
                name="Parents of Newly Diagnosed",
                description="A supportive space for parents and guardians navigating recent diagnoses. Share experiences, resources, and find comfort in a community that understands your journey.",
                category="Parents of Newly Diagnosed",
                creator_id="user-verified-sarah",
            )
            db.add(group_nd)
            db.commit()

            sarah_nd_gm = GroupMember(
                group_id="group-newly-diagnosed-1",
                user_id="user-verified-sarah",
                role="admin",
            )
            db.add(sarah_nd_gm)
            db.commit()

        # Seed initial posts for Parents of Newly Diagnosed
        post_nd_1 = db.query(Post).filter(Post.id == "post-nd-1").first()
        if not post_nd_1:
            post_nd_1 = Post(
                id="post-nd-1",
                author_id="user-verified-sarah",
                content="Hi everyone, we just received our diagnosis last week. It feels overwhelming to process all the medical paperwork and sensory schedules, but reading your posts has given us so much hope.",
                category="Parents of Newly Diagnosed",
                like_count=12,
                comment_count=5,
            )
            db.add(post_nd_1)

            post_nd_2 = Post(
                id="post-nd-2",
                author_id="user-verified-david",
                content="Does anyone have recommendations for noise-canceling headphones or quiet spaces for kids aged 4-6? We are planning our first family park trip after speech therapy.",
                category="Parents of Newly Diagnosed",
                like_count=24,
                comment_count=9,
            )
            db.add(post_nd_2)
            db.commit()

        # Seed initial post for feed tests
        post = db.query(Post).filter(Post.id == "post-welcome-1").first()
        if not post:
            post = Post(
                id="post-welcome-1",
                author_id="user-verified-sarah",
                content="Welcome caregivers to the NIVARA private community! Feel free to share resources and ask questions.",
                category="Resources",
                comment_count=1,
            )
            db.add(post)
            db.commit()

            # Seed initial comment on welcome post
            comment = Comment(
                id="comment-welcome-1",
                post_id="post-welcome-1",
                author_id="user-verified-david",
                content="Thank you Sarah! Excited to connect with other caregivers and share tools.",
            )
            db.add(comment)
            db.commit()

        post_emily = db.query(Post).filter(Post.id == "post-emily-1").first()
        if not post_emily:
            post_emily = Post(
                id="post-emily-1",
                author_id="user-verified-sarah",
                content="Today was a big win! My son tried a new sensory activity and loved it. Small steps, big progress 💙",
                category="Sensory Support",
                like_count=24,
                comment_count=8,
            )
            db.add(post_emily)
            db.commit()

        post_michael = db.query(Post).filter(Post.id == "post-michael-1").first()
        if not post_michael:
            post_michael = Post(
                id="post-michael-1",
                author_id="user-verified-david",
                content="Does anyone have tips for helping with school transitions? We're struggling with morning routines.",
                category="School Life",
                like_count=18,
                comment_count=12,
            )
            db.add(post_michael)
            db.commit()

        # Seed initial resources
        res1 = db.query(Resource).filter(Resource.id == "res-visual-schedule").first()
        if not res1:
            res1 = Resource(
                id="res-visual-schedule",
                title="Daily Visual Schedule Printable Template",
                description="Step-by-step visual routine cards with morning, school, and bedtime icons for children on the spectrum.",
                category="Education",
                file_type="template",
                url="https://nivara.app/resources/visual-schedule.pdf",
                author_id="user-verified-sarah",
            )
            db.add(res1)

            res2 = Resource(
                id="res-sensory-diet",
                title="Sensory Diet & Calming Tools Guide",
                description="Practical sensory diet strategies, proprioceptive activities, and deep-pressure techniques for emotional regulation.",
                category="Sensory",
                file_type="guide",
                url="https://nivara.app/resources/sensory-guide.pdf",
                author_id="user-verified-david",
            )
            db.add(res2)

            res3 = Resource(
                id="res-iep-checklist",
                title="Caregiver IEP Meeting Preparation Checklist",
                description="Essential questions, accommodation requests, and behavioral goal templates for annual school IEP meetings.",
                category="Advocacy",
                file_type="checklist",
                url="https://nivara.app/resources/iep-checklist.pdf",
                author_id="user-verified-sarah",
            )
            db.add(res3)
            db.commit()

        # Seed initial events
        event1 = db.query(Event).filter(Event.id == "event-1").first()
        if not event1:
            event1 = Event(
                id="event-1",
                title="Parent Support Circle",
                description="Monthly virtual circle for autism parent caregivers.",
                month_str="MAY",
                day_str="24",
                time_str="Sat, 10:00 AM",
                location="Online",
                event_type="Virtual Circle",
            )
            db.add(event1)

            event2 = Event(
                id="event-2",
                title="Mindful Caregiving",
                description="Stress regulation and mindfulness strategies for caregivers.",
                month_str="MAY",
                day_str="27",
                time_str="Tue, 07:00 PM",
                location="Online",
                event_type="Wellness Webinar",
            )
            db.add(event2)

            event3 = Event(
                id="event-3",
                title="Autism & Communication Workshop",
                description="Practical AAC and non-verbal communication strategies.",
                month_str="JUN",
                day_str="02",
                time_str="Sun, 11:00 AM",
                location="Community Center",
                event_type="In-Person Workshop",
            )
            db.add(event3)
            db.commit()

        # Seed Safety demo data: Child, Device, SafeZone, Emergency Contact
        leo = db.query(Child).filter(Child.id == "child-leo-1").first()
        if not leo:
            leo = Child(
                id="child-leo-1",
                caregiver_id="user-verified-sarah",
                name="Leo Mitchell",
                age=7,
                gender="Male",
                autism_level="Level 2",
                medical_notes="Sensitive to loud sirens. Non-verbal under acute distress.",
                tracking_enabled=True,
                current_status="safe",
            )
            db.add(leo)
            db.commit()

            band = Device(
                id="dev-band-leo-1",
                child_id="child-leo-1",
                device_name="NIVARA Smart SafeBand",
                device_type="gps_band",
                serial_number="NIVARA-BAND-LEO-001",
                battery_level=92,
                is_active=True,
                is_online=True,
            )
            db.add(band)

            home_zone = SafeZone(
                id="sz-home-1",
                child_id="child-leo-1",
                name="Home (Safe Haven)",
                zone_type="circle",
                center_latitude=37.7749,
                center_longitude=-122.4194,
                radius_meters=200.0,
                address="123 Serenity Way, San Francisco, CA",
                is_active=True,
                alert_on_exit=True,
            )
            db.add(home_zone)

            contact = EmergencyContact(
                id="contact-emily-1",
                user_id="user-verified-sarah",
                child_id="child-leo-1",
                name="Dr. Emily Watson",
                relationship_type="Behavioral Specialist",
                phone_number="+1-555-0199",
                priority_order=1,
                notify_via_sms=True,
                notify_via_call=True,
            )
            db.add(contact)

            loc = Location(
                id="loc-init-1",
                child_id="child-leo-1",
                device_id="dev-band-leo-1",
                latitude=37.7750,
                longitude=-122.4195,
                accuracy=4.2,
                speed=0.0,
                heading=90.0,
                battery_level=92.0,
                address="123 Serenity Way, San Francisco, CA",
            )
            db.add(loc)
            db.commit()

    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    startup_event()
